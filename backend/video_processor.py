"""
Video keypoint extraction processor for FYDP-3 Bangla Sign Language Recognition.
Replicates the exact MediaPipe Tasks extraction pipeline from updated_sign (1).ipynb (Cells 12, 16, 23):
  - 30 uniformly sampled frames via np.linspace(0, total-1, 30)
  - Pose: 33 landmarks x 3 = 99 (x, y, z)
  - Left Hand: 21 landmarks x 3 = 63 (x, y, z)
  - Right Hand: 21 landmarks x 3 = 63 (x, y, z)
  - Distance- and Scale-Invariant Shoulder Normalization:
      Mid-Shoulder = (P11 + P12) / 2
      Scale = ||P11 - P12||_2
      (x_i - x_mid) / Scale
  - Total Output Shape: (30, 225) float32
"""

import logging
import os
import urllib.request
from pathlib import Path
from typing import Tuple, Optional

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

from config import BASE_MODEL_DIR, NUM_FEATURES, SEQUENCE_LENGTH

logger = logging.getLogger("BSL_VideoProcessor")

MP_MODELS_DIR = BASE_MODEL_DIR / "mp_models"
MP_MODELS_DIR.mkdir(parents=True, exist_ok=True)

POSE_MODEL_PATH = MP_MODELS_DIR / "pose_landmarker.task"
HAND_MODEL_PATH = MP_MODELS_DIR / "hand_landmarker.task"

# Official Google MediaPipe model asset URLs
MODEL_URLS = {
    POSE_MODEL_PATH: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
    HAND_MODEL_PATH: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
}


def download_mp_models_if_needed():
    """Ensure all required MediaPipe task models are downloaded."""
    for path, url in MODEL_URLS.items():
        if not path.exists() or path.stat().st_size < 100000:
            logger.info("Downloading %s from %s ...", path.name, url)
            try:
                urllib.request.urlretrieve(url, str(path))
                logger.info("Downloaded %s successfully (%.2f MB)", path.name, path.stat().st_size / (1024 * 1024))
            except Exception as exc:
                logger.error("Failed to download %s: %s", path.name, exc)
                raise


def frame_to_mp_image(frame_bgr: np.ndarray) -> mp.Image:
    """Convert BGR OpenCV frame to MediaPipe SRGB Image."""
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    return mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))


def _extract_landmarks_array(landmarks, count: int) -> np.ndarray:
    """Extract raw (x, y, z) coordinates into an (N, 3) float32 array matching notebook cell 12."""
    if landmarks is None:
        return np.zeros((count, 3), dtype=np.float32)

    pts = []
    for lm in landmarks[:count]:
        pts.append([lm.x, lm.y, lm.z])

    if len(pts) < count:
        pts.extend([[0.0, 0.0, 0.0]] * (count - len(pts)))

    return np.asarray(pts[:count], dtype=np.float32)


def normalize_keypoints_to_shoulders(
    pose_pts: np.ndarray,
    left_hand_pts: np.ndarray,
    right_hand_pts: np.ndarray,
) -> np.ndarray:
    """
    ESSENTIAL CHANGE 2 from updated_sign (1).ipynb:
    Distance- and Scale-Invariant Shoulder Normalization.
    For all 75 keypoints (x_i, y_i, z_i):
      Mid-Shoulder = (P11 + P12) / 2
      Shoulder Width W = ||P11 - P12||_2
      x'_i = (x_i - x_mid) / W
      y'_i = (y_i - y_mid) / W
      z'_i = (z_i - z_mid) / W
    """
    # Landmark 11 = Left Shoulder, Landmark 12 = Right Shoulder
    left_sh = pose_pts[11]
    right_sh = pose_pts[12]

    has_left = (left_sh[0] != 0.0 or left_sh[1] != 0.0)
    has_right = (right_sh[0] != 0.0 or right_sh[1] != 0.0)

    if has_left and has_right:
        mid_shoulder = (left_sh + right_sh) / 2.0
        shoulder_width = float(np.linalg.norm(left_sh[:2] - right_sh[:2]))
        scale = shoulder_width if shoulder_width > 0.05 else 1.0
    elif has_left:
        mid_shoulder = left_sh.copy()
        scale = 1.0
    elif has_right:
        mid_shoulder = right_sh.copy()
        scale = 1.0
    else:
        mid_shoulder = np.array([0.5, 0.5, 0.0], dtype=np.float32)
        scale = 1.0

    # Normalize Pose (33 points)
    norm_pose = np.zeros_like(pose_pts)
    for i in range(len(pose_pts)):
        if pose_pts[i, 0] != 0.0 or pose_pts[i, 1] != 0.0:
            norm_pose[i] = (pose_pts[i] - mid_shoulder) / scale

    # Normalize Left Hand (21 points) - preserves 0.0 if hand was undetected
    norm_left_hand = np.zeros_like(left_hand_pts)
    if np.any(left_hand_pts):
        for i in range(len(left_hand_pts)):
            norm_left_hand[i] = (left_hand_pts[i] - mid_shoulder) / scale

    # Normalize Right Hand (21 points) - preserves 0.0 if hand was undetected
    norm_right_hand = np.zeros_like(right_hand_pts)
    if np.any(right_hand_pts):
        for i in range(len(right_hand_pts)):
            norm_right_hand[i] = (right_hand_pts[i] - mid_shoulder) / scale

    # Flatten and concatenate: 33*3 (99) + 21*3 (63) + 21*3 (63) = 225 features
    features = np.concatenate([
        norm_pose.flatten(),
        norm_left_hand.flatten(),
        norm_right_hand.flatten(),
    ]).astype(np.float32)

    return features


def extract_keypoints_from_results(pose_result, hand_result) -> np.ndarray:
    """Extract and normalize 225-D keypoints matching notebook cell 12."""
    # 1. Pose: 33 landmarks x 3 = 99
    if pose_result and pose_result.pose_landmarks:
        pose_pts = _extract_landmarks_array(pose_result.pose_landmarks[0], 33)
    else:
        pose_pts = np.zeros((33, 3), dtype=np.float32)

    # 2. Hands: Left (21x3=63) + Right (21x3=63)
    left_hand_pts = np.zeros((21, 3), dtype=np.float32)
    right_hand_pts = np.zeros((21, 3), dtype=np.float32)

    if hand_result and hand_result.hand_landmarks and hand_result.handedness:
        for hand_landmarks, handedness_list in zip(
            hand_result.hand_landmarks, hand_result.handedness
        ):
            label = handedness_list[0].category_name.lower()
            hand_vec = _extract_landmarks_array(hand_landmarks, 21)
            if label == "left":
                left_hand_pts = hand_vec
            elif label == "right":
                right_hand_pts = hand_vec

    features = normalize_keypoints_to_shoulders(pose_pts, left_hand_pts, right_hand_pts)
    assert features.shape == (NUM_FEATURES,), f"Feature shape mismatch: {features.shape} != ({NUM_FEATURES},)"
    return features


def extract_frames_from_video(video_path: str, num_frames: int = SEQUENCE_LENGTH) -> Tuple[Optional[list], dict]:
    """Uniformly sample num_frames from video file using np.linspace."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        cap.release()
        return None, {"error": "Could not open video file"}

    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration_sec = total / fps if fps > 0 else 0.0

    meta = {
        "total_frames": total,
        "fps": round(fps, 2),
        "width": width,
        "height": height,
        "duration_sec": round(duration_sec, 2),
    }

    if total <= 0:
        cap.release()
        return None, {**meta, "error": "Video has zero frames"}

    indices = np.linspace(0, total - 1, num_frames, dtype=int)
    frames = []

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ok, frame = cap.read()
        if ok and frame is not None:
            frames.append(frame)
        elif frames:
            frames.append(frames[-1].copy())
        else:
            frames.append(np.zeros((480, 640, 3), dtype=np.uint8))

    cap.release()
    return frames, meta


def process_video_to_sequence(video_path: str, sequence_length: int = SEQUENCE_LENGTH) -> Tuple[Optional[np.ndarray], dict]:
    """
    Full extraction matching updated_sign (1).ipynb Cell 23:
    1. Downloads MediaPipe models if not cached.
    2. Extracts sequence_length uniformly sampled frames.
    3. Runs Pose and Hand landmarkers for each frame.
    4. Applies shoulder distance- and scale-normalization.
    5. Produces a (30, 225) float32 numpy array.
    """
    download_mp_models_if_needed()

    frames, meta = extract_frames_from_video(video_path, sequence_length)
    if frames is None:
        return None, meta

    BaseOptions = python.BaseOptions
    RunningMode = vision.RunningMode

    pose_options = vision.PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(POSE_MODEL_PATH)),
        running_mode=RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    hand_options = vision.HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(HAND_MODEL_PATH)),
        running_mode=RunningMode.VIDEO,
        num_hands=2,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    pose_landmarker = vision.PoseLandmarker.create_from_options(pose_options)
    hand_landmarker = vision.HandLandmarker.create_from_options(hand_options)

    sequence = []
    try:
        for frame_idx, frame in enumerate(frames):
            timestamp_ms = int(frame_idx * 1000 / 30)
            image = frame_to_mp_image(frame)

            pose_result = pose_landmarker.detect_for_video(image, timestamp_ms)
            hand_result = hand_landmarker.detect_for_video(image, timestamp_ms)

            keypoints = extract_keypoints_from_results(pose_result, hand_result)
            sequence.append(keypoints)

        seq_np = np.asarray(sequence, dtype=np.float32)
        return seq_np, meta
    finally:
        pose_landmarker.close()
        hand_landmarker.close()

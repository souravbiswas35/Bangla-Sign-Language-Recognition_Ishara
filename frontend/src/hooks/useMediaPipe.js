/**
 * MediaPipe keypoint extraction hook for FYDP-3 Bangla Sign Language Recognition.
 *
 * Implements the 225-D Distance- and Scale-Invariant pipeline from updated_sign (1).ipynb:
 *   - Fast pose_landmarker_lite for low latency tracking
 *   - Anatomical wrist-proximity association for rock-solid Hand identification
 *     (Left hand stays Left hand, Right hand stays Right hand without flipping)
 *   - Distance- & Scale-Invariant Shoulder Normalization:
 *       Mid-Shoulder = (Left_Shoulder + Right_Shoulder) / 2
 *       Shoulder Width W = ||Left_Shoulder - Right_Shoulder||
 *       P'_i = (P_i - Mid_Shoulder) / W
 *   - Feature layout (225-D):
 *       Pose:       33 × 3 = 99 (x, y, z normalized)
 *       Left Hand:  21 × 3 = 63 (x, y, z normalized)
 *       Right Hand: 21 × 3 = 63 (x, y, z normalized)
 *       TOTAL = 225
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import {
  PoseLandmarker,
  FaceLandmarker,
  HandLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';

const POSE_LANDMARKS = 33;
const FACE_LANDMARKS = 468;
const HAND_LANDMARKS = 21;
export const NUM_FEATURES = 225;

const VISION_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

// High-speed, high-accuracy model assets
const MODEL_URLS = {
  pose: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
  face: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
  hand: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
};

export default function useMediaPipe() {
  const poseRef = useRef(null);
  const faceRef = useRef(null);
  const handRef = useRef(null);
  const lastTimestampRef = useRef(-1);

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function initLandmarkers() {
      try {
        setLoading(true);
        setError(null);

        const vision = await FilesetResolver.forVisionTasks(VISION_WASM_URL);

        async function createWithFallback(creatorFn, options) {
          try {
            return await creatorFn(vision, {
              ...options,
              baseOptions: { ...options.baseOptions, delegate: 'GPU' },
            });
          } catch (gpuErr) {
            console.warn('GPU delegate unavailable, using CPU:', gpuErr);
            return await creatorFn(vision, {
              ...options,
              baseOptions: { ...options.baseOptions, delegate: 'CPU' },
            });
          }
        }

        const [pose, face, hand] = await Promise.all([
          createWithFallback(PoseLandmarker.createFromOptions, {
            baseOptions: { modelAssetPath: MODEL_URLS.pose },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.45,
            minPosePresenceConfidence: 0.45,
            minTrackingConfidence: 0.45,
          }),
          createWithFallback(FaceLandmarker.createFromOptions, {
            baseOptions: { modelAssetPath: MODEL_URLS.face },
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: false,
            minFaceDetectionConfidence: 0.45,
            minFacePresenceConfidence: 0.45,
            minTrackingConfidence: 0.45,
          }),
          createWithFallback(HandLandmarker.createFromOptions, {
            baseOptions: { modelAssetPath: MODEL_URLS.hand },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.35,
            minHandPresenceConfidence: 0.35,
            minTrackingConfidence: 0.35,
          }),
        ]);

        if (cancelled) {
          pose.close();
          face.close();
          hand.close();
          return;
        }

        poseRef.current = pose;
        faceRef.current = face;
        handRef.current = hand;
        setReady(true);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize MediaPipe landmarkers:', err);
        if (!cancelled) {
          setError(err.message || 'MediaPipe initialization failed');
          setLoading(false);
        }
      }
    }

    initLandmarkers();

    return () => {
      cancelled = true;
      poseRef.current?.close();
      faceRef.current?.close();
      handRef.current?.close();
      poseRef.current = null;
      faceRef.current = null;
      handRef.current = null;
    };
  }, []);

  const extractKeypoints = useCallback(
    (video, timestampMs) => {
      if (!ready || !poseRef.current || !handRef.current) {
        return null;
      }

      let safeTimestamp = Math.round(timestampMs || performance.now());
      if (safeTimestamp <= lastTimestampRef.current) {
        safeTimestamp = lastTimestampRef.current + 1;
      }
      lastTimestampRef.current = safeTimestamp;

      try {
        const poseResult = poseRef.current.detectForVideo(video, safeTimestamp);
        const faceResult = faceRef.current ? faceRef.current.detectForVideo(video, safeTimestamp) : null;
        const handResult = handRef.current.detectForVideo(video, safeTimestamp);

        // ── 1. Extract Pose points (33) ──────────────────────────────────
        const rawPose = [];
        let leftWrist = null;
        let rightWrist = null;

        if (poseResult.landmarks && poseResult.landmarks.length > 0) {
          const lm = poseResult.landmarks[0];
          const lw = lm[15];
          const rw = lm[16];
          leftWrist = lw && (lw.visibility === undefined || lw.visibility > 0.25) ? lw : null;
          rightWrist = rw && (rw.visibility === undefined || rw.visibility > 0.25) ? rw : null;

          for (let i = 0; i < POSE_LANDMARKS; i++) {
            if (i < lm.length) {
              rawPose.push({ x: lm[i].x, y: lm[i].y, z: lm[i].z });
            } else {
              rawPose.push({ x: 0, y: 0, z: 0 });
            }
          }
        } else {
          for (let i = 0; i < POSE_LANDMARKS; i++) {
            rawPose.push({ x: 0, y: 0, z: 0 });
          }
        }

        // ── 2. Hands Association (Left: 21, Right: 21) ───────────────────
        const rawLeftHand = [];
        const rawRightHand = [];
        for (let i = 0; i < HAND_LANDMARKS; i++) {
          rawLeftHand.push({ x: 0, y: 0, z: 0 });
          rawRightHand.push({ x: 0, y: 0, z: 0 });
        }

        const assignedHandLandmarks = [];
        const assignedHandedness = [];

        if (handResult.landmarks && handResult.landmarks.length > 0) {
          const numHands = handResult.landmarks.length;
          let hand0IsLeft = true;

          if (numHands === 1) {
            const h0 = handResult.landmarks[0][0]; // wrist joint
            if (leftWrist && rightWrist) {
              const dL = Math.hypot(h0.x - leftWrist.x, h0.y - leftWrist.y);
              const dR = Math.hypot(h0.x - rightWrist.x, h0.y - rightWrist.y);
              hand0IsLeft = dL <= dR;
            } else {
              const cat = handResult.handedness?.[0]?.[0] || handResult.handednesses?.[0]?.[0];
              const label = (cat?.categoryName || cat?.displayName || '').toLowerCase();
              hand0IsLeft = label === 'left';
            }
          } else if (numHands >= 2) {
            const h0 = handResult.landmarks[0][0];
            const h1 = handResult.landmarks[1][0];

            if (leftWrist && rightWrist) {
              const d0L = Math.hypot(h0.x - leftWrist.x, h0.y - leftWrist.y);
              const d0R = Math.hypot(h0.x - rightWrist.x, h0.y - rightWrist.y);
              const d1L = Math.hypot(h1.x - leftWrist.x, h1.y - leftWrist.y);
              const d1R = Math.hypot(h1.x - rightWrist.x, h1.y - rightWrist.y);
              hand0IsLeft = (d0L + d1R) <= (d0R + d1L);
            } else {
              const cat0 = handResult.handedness?.[0]?.[0] || handResult.handednesses?.[0]?.[0];
              const label0 = (cat0?.categoryName || '').toLowerCase();
              if (label0 === 'left' || label0 === 'right') {
                hand0IsLeft = label0 === 'left';
              } else {
                hand0IsLeft = h0.x <= h1.x;
              }
            }
          }

          for (let h = 0; h < numHands && h < 2; h++) {
            const hLandmarks = handResult.landmarks[h];
            const isLeftHand = h === 0 ? hand0IsLeft : !hand0IsLeft;
            const targetArray = isLeftHand ? rawLeftHand : rawRightHand;

            for (let i = 0; i < HAND_LANDMARKS && i < hLandmarks.length; i++) {
              targetArray[i] = {
                x: hLandmarks[i].x,
                y: hLandmarks[i].y,
                z: hLandmarks[i].z,
              };
            }

            assignedHandLandmarks.push(hLandmarks);
            assignedHandedness.push([{ categoryName: isLeftHand ? 'Left' : 'Right' }]);
          }
        }

        // ── 3. Shoulder Normalization (Matching Notebook Cell 12) ────────
        // Landmark 11 = Left Shoulder, Landmark 12 = Right Shoulder
        const leftSh = rawPose[11];
        const rightSh = rawPose[12];
        const hasLeftSh = (leftSh.x !== 0 || leftSh.y !== 0);
        const hasRightSh = (rightSh.x !== 0 || rightSh.y !== 0);

        let midX = 0.5, midY = 0.5, midZ = 0.0, scale = 1.0;

        if (hasLeftSh && hasRightSh) {
          midX = (leftSh.x + rightSh.x) / 2.0;
          midY = (leftSh.y + rightSh.y) / 2.0;
          midZ = (leftSh.z + rightSh.z) / 2.0;
          const shoulderWidth = Math.hypot(leftSh.x - rightSh.x, leftSh.y - rightSh.y);
          scale = shoulderWidth > 0.05 ? shoulderWidth : 1.0;
        } else if (hasLeftSh) {
          midX = leftSh.x; midY = leftSh.y; midZ = leftSh.z;
        } else if (hasRightSh) {
          midX = rightSh.x; midY = rightSh.y; midZ = rightSh.z;
        }

        // ── 4. Build 225-D Normalized Float32Array ────────────────────────
        const keypoints = new Float32Array(NUM_FEATURES);
        let offset = 0;

        // Pose (33 points × 3 = 99)
        for (let i = 0; i < POSE_LANDMARKS; i++) {
          const pt = rawPose[i];
          if (pt.x !== 0 || pt.y !== 0) {
            keypoints[offset++] = (pt.x - midX) / scale;
            keypoints[offset++] = (pt.y - midY) / scale;
            keypoints[offset++] = (pt.z - midZ) / scale;
          } else {
            keypoints[offset++] = 0;
            keypoints[offset++] = 0;
            keypoints[offset++] = 0;
          }
        }

        // Left Hand (21 points × 3 = 63)
        let hasLeftHandPoints = false;
        for (let i = 0; i < HAND_LANDMARKS; i++) {
          if (rawLeftHand[i].x !== 0 || rawLeftHand[i].y !== 0) {
            hasLeftHandPoints = true;
            break;
          }
        }
        for (let i = 0; i < HAND_LANDMARKS; i++) {
          const pt = rawLeftHand[i];
          if (hasLeftHandPoints && (pt.x !== 0 || pt.y !== 0)) {
            keypoints[offset++] = (pt.x - midX) / scale;
            keypoints[offset++] = (pt.y - midY) / scale;
            keypoints[offset++] = (pt.z - midZ) / scale;
          } else {
            keypoints[offset++] = 0;
            keypoints[offset++] = 0;
            keypoints[offset++] = 0;
          }
        }

        // Right Hand (21 points × 3 = 63)
        let hasRightHandPoints = false;
        for (let i = 0; i < HAND_LANDMARKS; i++) {
          if (rawRightHand[i].x !== 0 || rawRightHand[i].y !== 0) {
            hasRightHandPoints = true;
            break;
          }
        }
        for (let i = 0; i < HAND_LANDMARKS; i++) {
          const pt = rawRightHand[i];
          if (hasRightHandPoints && (pt.x !== 0 || pt.y !== 0)) {
            keypoints[offset++] = (pt.x - midX) / scale;
            keypoints[offset++] = (pt.y - midY) / scale;
            keypoints[offset++] = (pt.z - midZ) / scale;
          } else {
            keypoints[offset++] = 0;
            keypoints[offset++] = 0;
            keypoints[offset++] = 0;
          }
        }

        return {
          keypoints,
          landmarks: {
            pose: poseResult.landmarks?.[0] ?? null,
            face: faceResult?.faceLandmarks?.[0] ?? null,
            hands: assignedHandLandmarks,
            handedness: assignedHandedness,
          },
        };
      } catch (err) {
        console.warn('MediaPipe frame processing skipped:', err);
        return null;
      }
    },
    [ready]
  );

  return { ready, loading, error, extractKeypoints };
}

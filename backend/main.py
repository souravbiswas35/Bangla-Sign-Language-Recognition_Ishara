"""
FastAPI backend for FYDP-3 Bangla Sign Language Recognition.

Endpoints:
  GET   /health            – Liveness check & loaded models report
  GET   /api/models        – List loaded models & action classes
  POST  /api/models/reload – Hot-reload models from disk without restarting server
  WS    /ws/predict        – Real-time keypoint → prediction stream
"""

from __future__ import annotations

import asyncio
import json
import logging
from collections import deque
from contextlib import asynccontextmanager
from typing import Any

import os
import shutil
import tempfile
from pathlib import Path

import joblib
import numpy as np
from urllib.parse import unquote
from fastapi import FastAPI, File, Form, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from video_processor import process_video_to_sequence

from config import (
    ACTIONS,
    BASE_MODEL_DIR,
    CONFIDENCE_THRESHOLD,
    CORS_ORIGINS,
    HOST,
    NUM_FEATURES,
    PORT,
    SCALER_PATH,
    SEQUENCE_LENGTH,
)
from model_loader import load_all_models

logger = logging.getLogger("BSL_Backend")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)

# ═══════════════════════════════════════════════════════════════════════
# Global state
# ═══════════════════════════════════════════════════════════════════════
models: dict[str, Any] = {}
scaler: Any = None
default_model_name: str = "Transformer"


def reload_models() -> dict:
    global models, scaler, default_model_name

    logger.info("Loading models from: %s", BASE_MODEL_DIR)
    models = load_all_models()

    for name in models:
        logger.info("  ✅ %s model loaded", name)

    # Set default model preference: Transformer > GRU > LSTM
    for candidate in ("Transformer", "GRU", "LSTM"):
        if candidate in models:
            default_model_name = candidate
            break

    logger.info("Default model set to: %s", default_model_name)

    # Load feature scaler
    if SCALER_PATH.exists():
        try:
            scaler = joblib.load(str(SCALER_PATH))
            logger.info("  ✅ Feature scaler loaded from %s", SCALER_PATH)
        except Exception as exc:
            logger.warning("  ⚠️ Could not load scaler (%s)", exc)
            scaler = None
    else:
        logger.warning("  ⚠️ Scaler not found at %s", SCALER_PATH)
        scaler = None

    return {
        "models_loaded": list(models.keys()),
        "default_model": default_model_name,
        "scaler_loaded": scaler is not None,
    }


def ensure_models_loaded():
    if not models:
        reload_models()


# ═══════════════════════════════════════════════════════════════════════
# Lifespan
# ═══════════════════════════════════════════════════════════════════════
@asynccontextmanager
async def lifespan(app: FastAPI):
    reload_models()
    yield
    logger.info("Shutting down BSL Backend …")


# ═══════════════════════════════════════════════════════════════════════
# App
# ═══════════════════════════════════════════════════════════════════════
app = FastAPI(
    title="FYDP-3 Bangla Sign Language Recognition API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════
# Sign Language Demonstration Videos
# ═══════════════════════════════════════════════════════════════════════
ASSETS_VIDEOS_DIR = (Path(__file__).resolve().parent.parent / "assets" / "videos").resolve()

VIDEO_LABEL_TO_FILE: dict[str, str] = {}
VIDEO_FILE_TO_LABEL: dict[str, str] = {}

if ASSETS_VIDEOS_DIR.exists():
    for f in sorted(ASSETS_VIDEOS_DIR.iterdir()):
        if f.is_file():
            fname = f.name
            prefix = fname.split(" (")[0].strip()
            VIDEO_FILE_TO_LABEL[fname] = prefix
            for action in ACTIONS:
                if (
                    prefix.lower() == action.lower()
                    or fname.lower().startswith(action.lower() + " ")
                    or fname.lower().startswith(action.lower() + "_")
                ):
                    VIDEO_LABEL_TO_FILE[action] = fname
                    break
    logger.info("Indexed %d sign language demo videos from %s", len(VIDEO_LABEL_TO_FILE), ASSETS_VIDEOS_DIR)

    # Mount static directory directly as fallback/direct access
    app.mount(
        "/assets/videos",
        StaticFiles(directory=str(ASSETS_VIDEOS_DIR)),
        name="assets_videos",
    )


# ═══════════════════════════════════════════════════════════════════════
# REST endpoints
# ═══════════════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    ensure_models_loaded()
    return {
        "project": "Bangla Sign Language Recognition (Ishara)",
        "status": "online",
        "health": "/health",
        "docs": "/docs",
        "models": list(models.keys()),
        "default_model": default_model_name,
    }

@app.get("/health")
async def health():
    ensure_models_loaded()
    return {
        "status": "ok",
        "models_loaded": list(models.keys()),
        "default_model": default_model_name,
        "scaler_loaded": scaler is not None,
    }


@app.get("/api/models")
async def list_models():
    ensure_models_loaded()
    return {
        "models": list(models.keys()),
        "default": default_model_name,
        "actions": ACTIONS,
        "sequence_length": SEQUENCE_LENGTH,
        "num_features": NUM_FEATURES,
        "scaler_loaded": scaler is not None,
    }


@app.post("/api/models/reload")
async def reload_endpoint():
    status = reload_models()
    return {"status": "reloaded", **status}


@app.get("/api/dictionary-videos")
async def get_dictionary_videos():
    """Return all 100 classes with their corresponding video URLs and details."""
    result = []
    for action in ACTIONS:
        fname = VIDEO_LABEL_TO_FILE.get(action)
        result.append({
            "label": action,
            "filename": fname,
            "video_url": f"/api/videos/{fname}" if fname else None,
            "has_video": fname is not None,
        })
    return {"classes": result, "total": len(result)}


@app.get("/api/videos/{video_ref:path}")
async def get_sign_video(video_ref: str):
    """
    Stream sign language demonstration video.
    video_ref can be the exact filename OR the class label (e.g. 'Dhonnobad').
    """
    decoded = unquote(video_ref)

    # 1. Check if it's an exact filename
    target_path = ASSETS_VIDEOS_DIR / decoded
    if not target_path.exists() or not target_path.is_file():
        # 2. Check if it's a class label
        if decoded in VIDEO_LABEL_TO_FILE:
            target_path = ASSETS_VIDEOS_DIR / VIDEO_LABEL_TO_FILE[decoded]
        else:
            # Case-insensitive label search
            for label, fname in VIDEO_LABEL_TO_FILE.items():
                if label.lower() == decoded.lower():
                    target_path = ASSETS_VIDEOS_DIR / fname
                    break

    if not target_path.exists() or not target_path.is_file():
        return JSONResponse(status_code=404, content={"error": f"Video not found for '{decoded}'"})

    suffix = target_path.suffix.lower()
    media_type = "video/quicktime" if suffix == ".mov" else "video/mp4"

    return FileResponse(
        path=str(target_path),
        media_type=media_type,
        filename=target_path.name,
    )


class PredictSequenceRequest(BaseModel):
    sequence: list[list[float]]
    model: str | None = None


@app.post("/api/predict")
async def api_predict(req: PredictSequenceRequest):
    seq_np = np.array(req.sequence, dtype=np.float32)
    if seq_np.shape != (SEQUENCE_LENGTH, NUM_FEATURES):
        return {
            "error": f"Invalid shape: expected ({SEQUENCE_LENGTH}, {NUM_FEATURES}), got {seq_np.shape}"
        }
    result = await asyncio.to_thread(predict_sequence, seq_np, req.model)
    return result


@app.post("/api/predict-video")
async def api_predict_video(
    video: UploadFile = File(...),
    model: str = Form("Transformer"),
):
    """
    Benchmark inference on an uploaded video file (.mp4, .webm, .avi, .mov).
    Replicates the exact training notebook preprocessing pipeline:
      1. Uniform 30-frame sampling via np.linspace(0, total-1, 30)
      2. MediaPipe Tasks: Pose (132), Face (1404), Left Hand (63), Right Hand (63)
      3. StandardScaler transform
      4. Model inference (Transformer / GRU / LSTM)
    """
    ensure_models_loaded()

    suffix = Path(video.filename).suffix if video.filename else ".mp4"
    if not suffix:
        suffix = ".mp4"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        shutil.copyfileobj(video.file, tmp)

    try:
        seq_np, meta = await asyncio.to_thread(
            process_video_to_sequence, tmp_path, SEQUENCE_LENGTH
        )
        if seq_np is None:
            return {"error": meta.get("error", "Failed to extract keypoints from video")}

        result = await asyncio.to_thread(predict_sequence, seq_np, model)
        result["video_metadata"] = meta
        result["filename"] = video.filename
        return result
    except Exception as exc:
        logger.exception("Error processing video: %s", exc)
        return {"error": str(exc)}
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass


# ═══════════════════════════════════════════════════════════════════════
# Inference helper
# ═══════════════════════════════════════════════════════════════════════

def predict_sequence(
    sequence: np.ndarray,
    model_name: str | None = None,
) -> dict:
    """
    Run inference on a (SEQUENCE_LENGTH, NUM_FEATURES) array.
    """
    ensure_models_loaded()

    name = model_name or default_model_name
    if name not in models:
        if default_model_name in models:
            name = default_model_name
        elif models:
            name = next(iter(models.keys()))

    if name not in models:
        return {
            "prediction": "No model loaded",
            "confidence": 0.0,
            "top5": [],
            "model_used": "No weights found in backend/models",
        }

    model = models[name]

    # Normalize with the exact StandardScaler fitted during training
    seq = sequence.copy().astype(np.float32)
    if scaler is not None:
        try:
            seq = scaler.transform(seq)
        except Exception as exc:
            logger.warning("Scaler transform failed: %s", exc)

    # Input batch shape (1, 30, 1662)
    inp = np.expand_dims(seq, axis=0)
    probs = model.predict(inp, verbose=0)[0]  # shape: (100,)

    top5_indices = np.argsort(probs)[::-1][:5]
    top5 = [
        {"label": ACTIONS[i], "confidence": round(float(probs[i]), 4)}
        for i in top5_indices
    ]

    best_idx = top5_indices[0]
    return {
        "prediction": ACTIONS[best_idx],
        "confidence": round(float(probs[best_idx]), 4),
        "top5": top5,
        "model_used": name,
    }


# ═══════════════════════════════════════════════════════════════════════
# WebSocket – Real-Time Keypoint Stream
# ═══════════════════════════════════════════════════════════════════════

@app.websocket("/ws/predict")
async def ws_predict(websocket: WebSocket):
    await websocket.accept()
    ensure_models_loaded()
    logger.info("WebSocket connected: %s (Loaded models: %s)", websocket.client, list(models.keys()))

    frame_buffer: deque[np.ndarray] = deque(maxlen=SEQUENCE_LENGTH)
    chosen_model: str = default_model_name

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)

            # Model switch request from client
            if "model" in data and data["model"] in models:
                chosen_model = data["model"]

            keypoints = data.get("keypoints")
            if keypoints is None:
                await websocket.send_json({"error": "missing 'keypoints'"})
                continue

            kp = np.array(keypoints, dtype=np.float32)

            if kp.shape == (NUM_FEATURES,):
                frame_buffer.append(kp)
            elif kp.shape == (SEQUENCE_LENGTH, NUM_FEATURES):
                frame_buffer.clear()
                for row in kp:
                    frame_buffer.append(row)
            else:
                await websocket.send_json({
                    "error": f"Invalid keypoints shape: expected ({NUM_FEATURES},), got {kp.shape}"
                })
                continue

            buffered = len(frame_buffer)

            # Need 30 frames to form a complete window
            if buffered < SEQUENCE_LENGTH:
                await websocket.send_json({
                    "status": "buffering",
                    "frames_buffered": buffered,
                    "frames_needed": SEQUENCE_LENGTH,
                })
                continue

            sequence = np.stack(list(frame_buffer), axis=0)

            # Run inference in worker thread
            result = await asyncio.to_thread(
                predict_sequence, sequence, chosen_model
            )
            result["frames_buffered"] = buffered

            await websocket.send_json(result)

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected: %s", websocket.client)
    except Exception as exc:
        logger.exception("WebSocket error: %s", exc)
        try:
            await websocket.close(code=1011, reason=str(exc))
        except Exception:
            pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True,
        log_level="info",
    )

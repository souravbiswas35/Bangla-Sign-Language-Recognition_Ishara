# Bangla-Sign-Language-Recognition_Ishara
### Production-Grade Full-Stack Web App (React + FastAPI + WebSockets + MediaPipe Tasks)

An end-to-end real-time sign language recognition and translation application for **100 Bangla Sign Language classes** (10,000 videos dataset), powered by **Vision Transformer**, **GRU**, and **LSTM** deep learning models trained on 225-D shoulder-normalized MediaPipe keypoints.

---

## 🌟 Key Architecture & Highlights

- **Edge Keypoint Extraction (Client-side MediaPipe)**:
  - Runs MediaPipe Tasks Vision (`PoseLandmarker`, `HandLandmarker`, `FaceLandmarker`) directly in the user's browser via WebAssembly & GPU acceleration.
  - Generates the exact **225-D feature vector** per frame matching the `updated_sign (1).ipynb` training pipeline:
    - **Pose**: 33 landmarks × (x, y, z) = 99 features
    - **Left Hand**: 21 landmarks × (x, y, z) = 63 features
    - **Right Hand**: 21 landmarks × (x, y, z) = 63 features
    - **Distance- & Scale-Invariant Shoulder Normalization**:
      $$\text{Mid-Shoulder} = \frac{P_{11} + P_{12}}{2}, \quad W = \|P_{11} - P_{12}\|_2, \quad P'_i = \frac{P_i - \text{Mid-Shoulder}}{W}$$
    - **Total**: 225 features / frame
  - Massive bandwidth savings: Only raw numeric float arrays are sent over WebSockets rather than heavy video frames.

- **Real-Time Streaming Backend (FastAPI + WebSockets)**:
  - Rolling sliding window buffer of 30 frames ($30 \times 225$).
  - Asynchronous non-blocking inference with TensorFlow.
  - Support for hot-swapping models on the fly:
    - **Transformer** (Positional Embedding + Multi-Head Self-Attention + LayerNorm)
    - **GRU** (2-Layer GRU + Dropout + Dense)
    - **LSTM** (2-Layer LSTM + Dropout + Dense)
  - Returns top-1 prediction, confidence score, and top-5 probability distribution.

- **Sleek Modern UI (React 19 + Vanilla CSS)**:
  - Dark-mode glassmorphism interface with subtle neon accents and micro-animations.
  - Interactive Canvas overlay displaying glowing skeleton, hand bones, and facial contours.
  - Circular animated confidence meter and top-5 softmax probabilities.
  - Continuous **Sentence Builder** with smart debouncing and history log.
  - **Text-to-Speech (TTS)**: Read aloud recognized words and constructed sentences in Bengali or English.
  - **100-Class Sign Dictionary Modal**: Searchable glossary with authentic Bengali script, Romanized names, English translations, and audio pronunciation.

---

## 📁 Project Directory Structure

```
FYDP-3/
├── 28_938_fydp3_memory_efficient (1).ipynb   # Colab training notebook
├── run_backend.bat                          # One-click launcher for backend
├── run_frontend.bat                         # One-click launcher for frontend
│
├── backend/                                 # FastAPI WebSocket Backend
│   ├── config.py                            # Hyperparameters, classes (100), paths
│   ├── main.py                              # FastAPI app, endpoints, WebSocket stream
│   ├── model_loader.py                      # Transformer, GRU, LSTM architectures & weights loader
│   ├── requirements.txt                     # Python dependencies
│   └── models/                              # Trained weights directory
│       └── README.md                        # Instructions for weight placement
│
└── frontend/                                # Vite + React Web Application
    ├── index.html                           # Entry HTML with Inter & Noto Sans Bengali
    ├── vite.config.js                       # Vite config with React plugin & proxy
    ├── package.json                         # Dependencies (@mediapipe/tasks-vision, react)
    └── src/
        ├── main.jsx                         # React root entry
        ├── App.jsx                          # Main container & state coordinator
        ├── index.css                        # Design system & glassmorphism theme
        ├── hooks/
        │   ├── useMediaPipe.js              # Client-side MediaPipe landmark extraction (225-D)
        │   └── useSignWebSocket.js          # WebSocket client with auto-reconnect & latency meter
        ├── components/
        │   ├── Header.jsx                   # Status badges & navigation
        │   ├── WebcamView.jsx               # Video feed, canvas skeleton, buffer progress, FPS
        │   ├── PredictionPanel.jsx          # Live prediction hero, circular meter, top-5, sentence builder
        │   └── GlossaryModal.jsx            # 100-class dictionary with search & categories
        ├── utils/
        │   ├── drawing.js                   # Canvas rendering for pose, hands & face mesh
        │   └── speech.js                    # Web Speech API TTS helper (Bangla/English)
        └── data/
            └── classes.js                   # 100 classes metadata (Bangla script, English meaning)
```

---

## 🚀 Quick Start Guide

### 1. Place Model Weights (Optional for Demo Mode)
Copy your saved weight files from your Google Drive into `backend/models/`:
- `Transformer_best.weights.h5` (or `Transformer_full_model.keras`)
- `GRU_best.weights.h5` (or `GRU_full_model.keras`)
- `LSTM_best.weights.h5` (or `LSTM_full_model.keras`)
- `feature_scaler.pkl` (if normalization was saved)

*(Note: If weights are not placed yet, the backend automatically runs in graceful demo mode, letting you test the full pipeline, camera, skeleton tracking, and WebSocket communication immediately).*

### 2. Start the Backend Server
Double-click `run_backend.bat` or run in terminal:
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API docs available at: `http://localhost:8000/docs`

### 3. Start the Frontend Application
Double-click `run_frontend.bat` or run in terminal:
```bash
cd frontend
npm run dev
```
Open your browser at: `https://localhost:5173`

For a complete mobile testing and troubleshooting guide, see [RUN_GUIDE.md](RUN_GUIDE.md).

---

## 🧪 Testing the Live Translation
1. Allow browser webcam access when prompted.
2. Click **Start Camera**.
3. Align your head and shoulders with the silhouette guide.
4. Click **Perform Sign (Spacebar)** (or press `Spacebar` key) and perform the sign gesture.
5. Review the recognized Bangla sign, English translation, and top-5 probability rankings.
6. Click **Add Word** to build a continuous Bangla sentence.
7. Click **Read Aloud** to hear the speech synthesis pronunciation in Bengali.
8. Toggle between **Dark and Light mode** anytime using the Sun/Moon button in the header.

<div align="center">

![Header](https://capsule-render.vercel.app/api?type=waving&color=0:1d4ed8,30:2563eb,70:4f46e5,100:7c3aed&height=220&section=header&text=ইশারা%20·%20Ishara&fontSize=42&fontColor=ffffff&fontAlignY=36&desc=Real-Time%20Bangla%20Sign%20Language%20AI%20Translation%20Platform&descAlignY=58&descColor=e0e7ff&animation=fadeIn)

<br/>

![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&duration=3000&pause=800&color=38BDF8&center=true&vCenter=true&width=750&lines=🤟+100+Bangla+Sign+Language+Classes+Recognized;🧠+Vision+Transformer+(ViT)+94.3%25+Test+Accuracy;⚡+Client-Side+MediaPipe+225-D+Keypoint+Pipeline;🌐+WebSocket+Streaming+Over+FastAPI+%26+React;🔊+Instant+Bengali+Text-to-Speech+(TTS)+Translation)

<br/>

[![Status](https://img.shields.io/badge/🚀%20Status-Production%20Ready-1d4ed8?style=for-the-badge)](https://github.com/souravbiswas35/Bangla-Sign-Language-Recognition_Ishara)
[![Model Accuracy](https://img.shields.io/badge/🎯%20ViT%20Accuracy-94.3%25-2563eb?style=for-the-badge)](https://github.com/souravbiswas35/Bangla-Sign-Language-Recognition_Ishara)
[![Classes](https://img.shields.io/badge/🤟%20Classes-100%20Signs%20(10k%20vids)-4f46e5?style=for-the-badge)](https://github.com/souravbiswas35/Bangla-Sign-Language-Recognition_Ishara)
[![Frontend](https://img.shields.io/badge/React%2019-Vite%20SPA-7c3aed?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Backend](https://img.shields.io/badge/FastAPI-Python%203.11-0ea5e9?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Holistic%20Vision-06b6d4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-Deep%20Learning-ff6f00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ed?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

</div>

---

## 🌐 Live Deployments & Interactive Links

<div align="center">

| | Platform | Service | Status | Link |
|:-:|:--------:|:-------:|:------:|:----:|
| 💻 | **Web App** | Vercel (Edge SPA) | ![Live](https://img.shields.io/badge/Online-10b981?style=flat-square) | [![Visit App](https://img.shields.io/badge/Open%20Web%20App→-1d4ed8?style=for-the-badge&logo=vercel&logoColor=white)](https://bangla-sign-language-recognition-is.vercel.app) |
| ⚡ | **AI Backend** | Render (Docker Cloud) | ![Live](https://img.shields.io/badge/Online-10b981?style=flat-square) | [![Visit API](https://img.shields.io/badge/API%20Endpoint→-2563eb?style=for-the-badge&logo=render&logoColor=white)](https://bangla-sign-backend.onrender.com) |
| 📚 | **Interactive Docs** | Swagger / OpenAPI | ![Active](https://img.shields.io/badge/Docs-4f46e5?style=flat-square) | [![API Docs](https://img.shields.io/badge/Swagger%20UI→-7c3aed?style=for-the-badge&logo=swagger&logoColor=white)](https://bangla-sign-backend.onrender.com/docs) |

> 💡 **Notice**: The backend operates on Render free tier. If cold, the first request may take 30–45 seconds to spin up containers and warm model weights into memory.

</div>

---

## 🎥 225-D Sign Language Keypoint Vision Pipeline

<div align="center">

<img src="https://raw.githubusercontent.com/souravbiswas35/Bangla-Sign-Language-Recognition_Ishara/main/assets/sign_keypoints_animation.svg?v=3" width="100%" alt="Sign Language Keypoint Skeleton Animation" />

<br/>

> 🤟 **Pure Keypoint Representation (No Video / No Real Hand Footage)**: The client extracts 75 holistic spatial landmarks (Pose: 33 pts + Left Hand: 21 pts + Right Hand: 21 pts = 225-D vector), normalizes them against shoulder span $W = \|P_{11} - P_{12}\|_2$, and streams numerical coordinates to the Vision Transformer model in real time.

</div>

---

## 📖 Overview

**ইশারা (Ishara)** is an end-to-end, production-grade Artificial Intelligence system designed to bridge the communication gap between the **Deaf and Hard-of-Hearing (DHH)** community and the speaking population of Bangladesh.

Operating across **100 authentic Bangla Sign Language (BdSL) vocabulary classes** trained on a curated corpus of **10,000 video samples**, Ishara executes real-time translation through a client-side **MediaPipe Holistic Vision** pipeline coupled with high-accuracy **Vision Transformer (ViT)** and Recurrent Neural Network architectures.

> 🔷 **Zero Video Uploads**: Keypoint extraction occurs entirely inside the client's browser using WebAssembly & WebGL.  
> 🔷 **High Privacy & Efficiency**: Only raw numeric float vectors (225-D) stream to the backend, consuming 98% less bandwidth than raw video streams.  
> 🔷 **Complete Sentence Builder**: Seamlessly translates gesture sequences into fluent Bangla sentences with natural voice pronunciation.

---

## 🎯 Motivation & Problem Statement

| # | Challenge | Solution Provided by Ishara |
|---|-----------|-----------------------------|
| 1 | 🔇 **Communication Barrier** | Over 3 million speech- and hearing-impaired individuals in Bangladesh face daily isolation in healthcare, education, and legal services. Ishara offers zero-cost, instant two-way translation. |
| 2 | 📉 **Limited Vocabulary in Prior Work** | Existing BdSL literature is heavily restricted to isolated alphabets or 10–36 digits/words. Ishara scales to **100 comprehensive conversational vocabulary signs**. |
| 3 | 💸 **Hardware Accessibility** | Most gesture systems require specialized sensory gloves or multi-camera depth rigs. Ishara functions on any standard laptop webcam or low-cost smartphone camera. |
| 4 | 📶 **Low-Bandwidth Mobile Networks** | Transmitting 30 FPS high-definition video over 3G/4G connections causes lag. Ishara extracts landmarks on-device and transmits lightweight 225-D coordinate arrays over WebSockets. |
| 5 | 🗣️ **Literacy & Output Integration** | Many deaf individuals have hearing family members who cannot read sign glosses. Ishara synthesizes spoken Bangla audio via the Web Speech Synthesis API. |

---

## ✨ Key Features & Architectural Capabilities

<table>
<tr>
<td width="50%" valign="top">

### 👁️ Client-Side Vision Intelligence
- ⚡ **MediaPipe Holistic Tasks (WASM + GPU)**: Runs pose, face contour, and dual hand trackers entirely in browser at 30+ FPS.
- 📐 **Distance-Invariant Normalization**: Features are normalized relative to shoulder width ($\|P_{11} - P_{12}\|_2$), ensuring robustness across different user distances.
- 🪞 **Dynamic Coordinate Mirroring**: Toggleable X-axis coordinate inverter for perspective testing against front-facing camera feeds.
- 🎯 **Silhouette & Distance Alignment Guide**: Visual UI overlay assisting users to position themselves at the optimal dataset distance.

</td>
<td width="50%" valign="top">

### 🧠 Deep Learning Translation Pipeline
- 🔮 **Vision Transformer (ViT)**: Multi-Head Self-Attention layers capturing complex spatio-temporal dependencies across frames (**94.3% accuracy**).
- 🔁 **Hot-Swappable Model Architectures**: Live switching between Vision Transformer, 2-Layer Bi-GRU, and 2-Layer Bi-LSTM models.
- 📊 **Real-time Softmax Probability Meter**: Top-1 confidence meter with full Top-5 candidate probability distribution breakdown.
- 💬 **Sentence Builder with Bangla TTS**: Interactive assembly log with one-click speech synthesis in authentic Bengali (`bn-BD`).

</td>
</tr>
</table>

---

## 🔄 End-to-End System Workflow

```
   🎥 Live Webcam / Video Feed
               ↓
   ⚡ MediaPipe Holistic Vision (Browser WASM / GPU)
       ├── Pose Landmarks     (33 pts × 3 = 99 features)
       ├── Left Hand          (21 pts × 3 = 63 features)
       └── Right Hand         (21 pts × 3 = 63 features)
               ↓
   📐 Mid-Shoulder Normalization & Standardization
       Midpoint = (P11 + P12) / 2
       Scale    = || P11 - P12 ||2
       P'_i     = (P_i - Midpoint) / Scale  →  [225-D Vector]
               ↓
   🌐 WebSocket Bi-Directional Stream (FastAPI)
       Sliding Window Buffer: [30 frames × 225 dimensions]
               ↓
   🧠 Deep Learning Inference Engine (ViT / GRU / LSTM)
               ↓
   📊 Softmax Probabilities  →  Top-1 Sign + Top-5 Candidates
               ↓
   📝 Sentence Assembly  →  🔊 Bangla Text-to-Speech (TTS)
```

---

## 📐 Mathematical Formulation: 225-D Feature Pipeline

The Ishara feature extraction engine transforms uncalibrated 2D webcam video into distance-invariant, scale-normalized 3D spatial feature vectors through a structured three-stage mathematical pipeline.

```text
========================================================================================
                 225-D NORMALIZATION MATHEMATICAL PIPELINE ARCHITECTURE
========================================================================================

  [1] MID-SHOULDER CENTER ANCHOR (Translation Invariance):
      Midpoint = (P11 + P12) / 2
               = ( [x11 + x12]/2,  [y11 + y12]/2,  [z11 + z12]/2 )

  [2] EUCLIDEAN SHOULDER SPAN (Distance & Scale Factor W):
      W = || P11 - P12 ||2
        = sqrt[ (x11 - x12)^2 + (y11 - y12)^2 + (z11 - z12)^2 ]

  [3] DISTANCE-INVARIANT LANDMARK NORMALIZATION:
      L'i = ( Li - Midpoint ) / W

  [4] UNIFIED 225-DIMENSIONAL SPATIAL FEATURE VECTOR:
      v_t = [ P'_0:32 (99D),  H'_Left (63D),  H'_Right (63D) ]^T  ∈  R^225

  [5] SPATIO-TEMPORAL TENSOR BUFFER (Sliding Window):
      X   = [ v_{t-29},  v_{t-28},  ...,  v_t ]^T  ∈  R^{Batch × 30 × 225}

========================================================================================
```

---

### 📋 Mathematical Pipeline Architecture Matrix

| Stage | Operation | Mathematical Formula | Dimensions | Invariance Property |
|:------|:----------|:---------------------|:----------:|:--------------------|
| **Step 1** | **Center Anchor** | `Mid = (P₁₁ + P₁₂) / 2` | 3D Point `(x, y, z)` | Translation Invariance (cancels user position offset) |
| **Step 2** | **Scale Metric** | `W = ‖P₁₁ - P₁₂‖₂ = √[ Σ (Δcoord)² ]` | Scalar Metric `W > 0` | Distance Invariance (cancels webcam zoom/distance) |
| **Step 3** | **Keypoint Scaling** | `L'ᵢ = (Lᵢ - Mid) / W` | 75 Landmarks $\times 3$ | Scale Invariance (neutralizes body proportion variance) |
| **Step 4** | **Vector Flattening** | `v_t = [P'₀:₃₂, H'_Left, H'_Right]ᵀ` | **225 Features** | Unified 1D frame vector passed to WebSocket |
| **Step 5** | **Rolling Buffer** | `X = [v_{t-29}, v_{t-28}, ..., v_t]ᵀ` | **`[1 × 30 × 225]`** | Spatio-temporal tensor evaluated by ViT / RNN |

---

### 🔍 Detailed Step-by-Step Breakdown

#### 1️⃣ Spatial Landmark Acquisition ($75 \text{ Points} \rightarrow 225\text{-D}$)
For each video frame at time $t$, MediaPipe Holistic Vision extracts spatial coordinate triplets $(x_i, y_i, z_i) \in \mathbb{R}^3$ across 75 anatomical keypoints:
- **Upper Pose ($P$)**: 33 keypoints $\times 3 = 99$ spatial coordinates (torso, shoulders, elbows, wrists)
- **Left Hand ($H_L$)**: 21 keypoints $\times 3 = 63$ spatial coordinates (full 21-joint articulated hand skeleton)
- **Right Hand ($H_R$)**: 21 keypoints $\times 3 = 63$ spatial coordinates (full 21-joint articulated hand skeleton)
- **Total Raw Vector ($\mathbf{u}_t$)**: $99 + 63 + 63 = \mathbf{225\text{ numeric features}}$

#### 2️⃣ Distance-Invariant Mid-Shoulder Normalization
To prevent false classifications when users stand closer or further from their webcam, the coordinate system is dynamically anchored and normalized:
1. **Midpoint Center**: The midpoint between left shoulder $P_{11}$ and right shoulder $P_{12}$ is calculated as the origin $(0, 0, 0)$.
2. **Shoulder Span ($W$)**: The Euclidean distance ($L_2$-norm) between $P_{11}$ and $P_{12}$ establishes the scale unit.
3. **Normalized Landmark ($L'_i$)**: Every landmark coordinate is translated relative to the midpoint and divided by $W$.

#### 3️⃣ Temporal Windowing & Sliding Tensor Assembly
The normalized frame vector $\mathbf{v}_t \in \mathbb{R}^{225}$ is pushed into a FIFO circular buffer of length $T = 30$ frames ($\approx 1.0\text{ second}$ at $30\text{ FPS}$). The resulting tensor $\mathbf{X} \in \mathbb{R}^{1 \times 30 \times 225}$ is fed into the Vision Transformer self-attention layers for real-time Softmax classification.

---

## 🏆 Benchmark & Model Comparison

> Evaluated on the 100-class curated Bangla Sign Language dataset (10,000 video sequences).

| Architecture | Parameters | Frame Window | Latency (Inference) | Top-1 Test Accuracy | Top-5 Accuracy |
|:-------------|:----------:|:------------:|:-------------------:|:-------------------:|:--------------:|
| 🌟 **Vision Transformer (ViT)** | **1.42M** | **30 Frames** | **~12 ms** | **94.30%** | **99.10%** |
| ⚡ **Bidirectional GRU (2-Layer)** | 890K | 30 Frames | ~9 ms | 91.80% | 97.60% |
| 🔁 **Bidirectional LSTM (2-Layer)** | 1.15M | 30 Frames | ~10 ms | 90.50% | 96.80% |

### 🔍 Comparison with Existing BdSL Platforms

| System / Literature | Vocabulary Size | Input Modality | Architecture | Real-Time Web | Speech Output |
|:--------------------|:---------------:|:--------------:|:------------:|:-------------:|:-------------:|
| BdSL-36 Dataset (2020) | 36 Signs | Raw RGB Images | CNN (VGG16) | ❌ | ❌ |
| Ishara-Lipi (2018) | 50 Alphabets | Isolated Images | ResNet-50 | ❌ | ❌ |
| BDSL Digits (2022) | 10 Digits | Sensor Glove | Random Forest | ❌ | ❌ |
| **ইশারা · Ishara (Ours)** | **100 Vocabulary Signs** | **225-D Holistic Vectors** | **Vision Transformer** | **✅ WebSocket** | **✅ Bangla TTS** |

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🎨 **Frontend UI** | React 19 + Vite | High-performance Single Page Application (SPA) |
| 🖌️ **Design System** | Vanilla CSS3 (Custom Tokens) | Glassmorphism, animated constellation web, responsive HUD |
| 👁️ **Client AI Vision** | `@mediapipe/tasks-vision` | On-device WebAssembly pose, hand, and face tracking |
| ⚙️ **Backend Server** | FastAPI (Python 3.11) | Asynchronous REST and real-time WebSocket server |
| 🧠 **Deep Learning** | TensorFlow / Keras | Vision Transformer, Bi-GRU, and Bi-LSTM inference |
| 🔊 **Audio Synthesis** | Web Speech API | Native client-side Bangla TTS (`bn-BD`) voice output |
| 🐳 **DevOps & Cloud** | Docker, Vercel, Render | Multi-stage Docker containerization and edge hosting |

---

## 📁 Repository Structure

```text
Bangla-Sign-Language-Recognition_Ishara/
├── 📂 assets/                               # Visual assets & code-generated animations
│   └── sign_keypoints_animation.svg         # 225-D MediaPipe keypoints SVG animation
│
├── 📂 backend/                              # FastAPI WebSocket Inference Backend
│   ├── 📂 models/                           # Pretrained deep learning models & scaler
│   │   ├── Transformer_full_model.keras     # Vision Transformer (ViT) primary model
│   │   ├── GRU_full_model.keras             # Bidirectional GRU model
│   │   ├── LSTM_full_model.keras            # Bidirectional LSTM model
│   │   └── feature_scaler.pkl               # MinMax feature normalizer
│   ├── config.py                            # 100 classes dictionary, thresholds, settings
│   ├── main.py                              # FastAPI endpoints & WebSocket stream handler
│   ├── model_loader.py                      # Multi-model architecture loader & inference
│   ├── video_processor.py                   # Benchmark offline video file keypoint processor
│   ├── requirements.txt                     # Python packages (fastapi, tensorflow, uvicorn)
│   └── Dockerfile                           # Container configuration for Render cloud
│
├── 📂 frontend/                             # React 19 SPA (Vite)
│   ├── 📂 public/                           # Static assets, logos & favicon
│   ├── 📂 src/
│   │   ├── 📂 components/                   # UI components
│   │   │   ├── Header.jsx                   # Status monitors, glossary trigger, theme toggle
│   │   │   ├── WebcamView.jsx               # Cyber web canvas, camera controls, HUD overlay
│   │   │   ├── PredictionPanel.jsx          # Live prediction hero, top-5 list, sentence builder
│   │   │   ├── VideoUploadView.jsx          # Benchmark offline video file analysis
│   │   │   ├── GlossaryModal.jsx            # 100-class dictionary with search & category filters
│   │   │   └── Icons.jsx                    # Optimized inline vector icons
│   │   ├── 📂 hooks/                        # Custom React hooks
│   │   │   ├── useMediaPipe.js              # Client-side 225-D keypoint extraction & smoothing
│   │   │   └── useSignWebSocket.js          # Resilient WebSocket connection manager
│   │   ├── 📂 utils/                        # Frontend utilities
│   │   │   ├── drawing.js                   # Canvas landmark rendering (skeleton, hands, mesh)
│   │   │   └── speech.js                    # Web Speech API Bangla text-to-speech engine
│   │   ├── 📂 data/
│   │   │   └── classes.js                   # 100 BdSL signs metadata (Bangla, Roman, English)
│   │   ├── config.js                        # Dynamic WebSocket & API environment config
│   │   ├── index.css                        # Professional unified design system & animations
│   │   ├── App.jsx                          # Main view coordinator & state orchestrator
│   │   └── main.jsx                         # Application entry root
│   ├── index.html                           # Single Page Application HTML entry point
│   ├── vercel.json                          # Vercel deployment rewrite rules
│   ├── package.json                         # Node dependencies & build scripts
│   └── vite.config.js                       # Vite bundler & reverse proxy rules
│
├── 📓 28_938_fydp3_memory_efficient.ipynb   # Model training & comparative evaluation notebook
├── 📓 updated_sign.ipynb                    # Keypoint extraction & dataset preprocessing
├── 🚀 run_backend.bat                       # One-click Windows launcher for backend
├── 🚀 run_frontend.bat                      # One-click Windows launcher for frontend
├── 🧹 clean_project.bat                     # Temporary cache and cleanup utility
├── 📘 BATCH_SCRIPTS_EXPLAINED.md            # Batch script architecture & usage guide
├── 📘 DEPLOYMENT_GUIDE.md                   # Full production deployment manual (Render & Vercel)
├── 📗 RUN_GUIDE.md                          # Local execution & mobile setup guide
├── ⚙️ render.yaml                           # Infrastructure as Code specification for Render
└── 📄 README.md                             # Comprehensive project documentation
```

---

## 🚀 Local Development Setup

<div align="center">

![Quick Setup Typing](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=19&duration=2500&pause=600&color=10B981&center=true&vCenter=true&width=680&lines=⚡+One-Click+Windows+Batch+Execution;💻+Instant+Copy-Paste+Terminal+Pipelines;🐳+Production-Ready+Docker+Containers;📱+Local+Wi-Fi+Mobile+Webcam+Testing)

<br/>

[![Quick Launch](https://img.shields.io/badge/⚡%20Windows-1--Click%20Launchers-10b981?style=for-the-badge&logo=windows&logoColor=white)](#-option-a-one-click-launchers-recommended-for-windows)
[![PowerShell](https://img.shields.io/badge/Windows-PowerShell%20Pipeline-1d4ed8?style=for-the-badge&logo=powershell&logoColor=white)](#-windows-powershell--cmd)
[![Linux](https://img.shields.io/badge/Linux%20%2F%20macOS-Bash%20Pipeline-f59e0b?style=for-the-badge&logo=gnubash&logoColor=white)](#-linux--macos-bash--zsh)
[![Docker](https://img.shields.io/badge/Docker-Containerized%20Build-0ea5e9?style=for-the-badge&logo=docker&logoColor=white)](#-docker-containerized-run)

</div>

### 📋 Prerequisites & Environment Check
| Component | Minimum Version | Recommended | Notes |
|:----------|:---------------:|:-----------:|:------|
| 🐍 **Python** | `3.10` | `3.11 (64-bit)` | Required for FastAPI, TensorFlow & Uvicorn |
| 🟩 **Node.js** | `18.0.0` | `20.x LTS` | Required for React 19 + Vite bundler |
| 📦 **Package Manager** | `npm 9+` | `npm` or `pnpm` | Bundled with Node.js |
| 🌐 **Web Browser** | Chrome 110+, Edge 110+, Safari 16+ | Chrome / Edge | WebAssembly & WebGL GPU support required |

---

### 📥 1. Clone the Repository

Click the copy button on the right to copy the clone command:

```bash
git clone https://github.com/souravbiswas35/Bangla-Sign-Language-Recognition_Ishara.git
cd Bangla-Sign-Language-Recognition_Ishara
```

---

### 📋 Quick-Copy Command Matrix

> [!TIP]
> **How to Copy Commands**:
> - **In GitHub**: Hover over any code box below to reveal GitHub's native **📋 Copy** icon in the upper-right corner.
> - **Direct Selection**: You can also double-click on any command in the table below to quickly copy it to your terminal:

| Action / Workflow | Environment | Quick-Copy Command | Run Target |
|:------------------|:-----------:|:-------------------|:----------:|
| 🚀 **Run Backend (1-Click)** | 🪟 Windows | `.\run_backend.bat` | Root directory |
| 🚀 **Run Frontend (1-Click)** | 🪟 Windows | `.\run_frontend.bat` | Root directory |
| 🧹 **Clean Temp & Cache** | 🪟 Windows | `.\clean_project.bat` | Root directory |
| ⚡ **Full Backend Pipeline** | 🪟 PowerShell | `cd backend; python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload` | Terminal |
| ⚡ **Full Backend Pipeline** | 🐧 Linux / macOS | `cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload` | Terminal |
| ⚡ **Full Frontend Pipeline** | 🌐 All Platforms | `cd frontend && npm install && npm run dev` | Terminal |
| 🐳 **Docker Backend Run** | 🐳 Docker CLI | `docker build -t bangla-sign-backend ./backend && docker run -p 8000:8000 bangla-sign-backend` | Terminal |

---

### ⚡ Option A: One-Click Launchers (Recommended for Windows)

> [!TIP]
> **Windows Batch Automation**: Simply execute the included batch scripts from the project root. They will automatically verify environment variables, set up virtual environments, install dependencies, and launch servers.

#### 🔹 Run Backend Server (FastAPI on Port 8000)
```cmd
.\run_backend.bat
```

#### 🔹 Run Frontend Client (Vite on Port 5173)
```cmd
.\run_frontend.bat
```

#### 🔹 Clean Cache & Temporary Build Artifacts
```cmd
.\clean_project.bat
```

---

### 💻 Option B: One-Line Copyable Terminal Commands

Use these single-line commands to copy and paste directly into your terminal with **1 click**:

#### 🪟 Windows (PowerShell / CMD)

**Backend Server (creates venv, installs requirements, starts Uvicorn with reload):**
```powershell
cd backend; python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend Client (installs node modules and starts Vite dev server):**
```powershell
cd frontend; npm install; npm run dev
```

#### 🐧 Linux / macOS (Bash / Zsh)

**Backend Server:**
```bash
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend Client:**
```bash
cd frontend && npm install && npm run dev
```

#### 🐳 Docker (Containerized Run)

**Build & Run Backend Container:**
```bash
docker build -t bangla-sign-backend ./backend && docker run -p 8000:8000 bangla-sign-backend
```

---

### 🛠️ Option C: Step-by-Step Manual Execution

<details>
<summary><b>🔍 Click to expand step-by-step breakdown (Backend & Frontend)</b></summary>

<br/>

#### 1️⃣ Backend Setup
Navigate into the `backend/` directory:
```bash
cd backend
```

Create Python virtual environment:
```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows PowerShell**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows Command Prompt (CMD)**:
  ```cmd
  venv\Scripts\activate.bat
  ```
- **Linux / macOS**:
  ```bash
  source venv/bin/activate
  ```

Install required dependencies:
```bash
pip install -r requirements.txt
```

Start the FastAPI inference server:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

#### 2️⃣ Frontend Setup
Open a **new terminal** and navigate into the `frontend/` directory:
```bash
cd frontend
```

Install Node.js packages:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

</details>

---

### 🌐 Local Service Verification & Endpoints

Once running, verify all services using the following local addresses:

| Service | Address | Protocol | Status Check | Action |
|:--------|:--------|:--------:|:------------:|:------:|
| 💻 **Frontend Web App** | `http://localhost:5173` | HTTP | ![Active](https://img.shields.io/badge/Port_5173-10b981?style=flat-square) | [![Open App](https://img.shields.io/badge/Open_Browser→-1d4ed8?style=for-the-badge)](http://localhost:5173) |
| ⚡ **FastAPI Backend** | `http://localhost:8000` | HTTP | ![Active](https://img.shields.io/badge/Port_8000-2563eb?style=flat-square) | [![Health Check](https://img.shields.io/badge/Health_API→-0ea5e9?style=for-the-badge)](http://localhost:8000/health) |
| 📚 **Interactive Swagger Docs** | `http://localhost:8000/docs` | OpenAPI | ![Docs](https://img.shields.io/badge/Swagger_UI-7c3aed?style=flat-square) | [![Open Swagger](https://img.shields.io/badge/API_Docs→-4f46e5?style=for-the-badge)](http://localhost:8000/docs) |
| 🔄 **WebSocket Stream Endpoint** | `ws://localhost:8000/ws/predict` | WS / WSS | ![Active](https://img.shields.io/badge/Live_Stream-06b6d4?style=flat-square) | `ws://localhost:8000/ws/predict` |

---

### 📱 Mobile Device Testing Over Local Wi-Fi

> [!NOTE]
> **Camera Permission on Mobile**: Modern mobile browsers (iOS Safari, Android Chrome) enforce camera permissions strictly over `localhost` or `HTTPS`. To test on your smartphone connected to the same Wi-Fi network:
> 
> ```bash
> cd frontend && npm run dev -- --host
> ```
> Open the Network URL output in your terminal (e.g. `http://192.168.x.x:5173`) on your mobile browser. Ensure the backend host is reachable.

---

## 🌍 Real-World Impact

| 🏥 Healthcare Access | 🏫 Inclusive Education | 🏛️ Public Services |
|:--------------------:|:----------------------:|:--------------------:|
| Deaf patients can independently communicate symptoms to doctors without needing a human interpreter. | Hearing-impaired students can express answers and participate in regular classrooms in real time. | Simplifies transactions at banks, utility offices, and police stations with instant transcription. |

| 💼 Employment Equality | 📱 Hardware Agnostic | 🤝 Social Dignity |
|:----------------------:|:--------------------:|:-----------------:|
| Empowers deaf job seekers in interviews and workplace discussions. | Runs smoothly on entry-level Android devices and low-cost laptops. | Restores independence, communication freedom, and dignity to millions. |

---

## 👥 Authors & Team

> *Developed as a Final Year Design Project (FYDP) dedicated to advancing assistive technology for the Bangladeshi DHH community.*

<div align="center">

| 👨‍💻 Contributor | 🔗 GitHub Profile |
|:----------------:|:-----------------:|
| **Sourav Biswas** | [![GitHub](https://img.shields.io/badge/souravbiswas35-1d4ed8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/souravbiswas35) |
| **Saidul Islam Shuvo** | [![GitHub](https://img.shields.io/badge/shuivva-2563eb?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shuivva) |
| **Sakibul Alam** | [![GitHub](https://img.shields.io/badge/SakibulAlam001-4f46e5?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SakibulAlam001) |

</div>

---

## 📄 License & Attribution

This project is licensed under the **MIT License** — feel free to use, modify, and distribute with attribution.

---

<div align="center">

![Footer](https://capsule-render.vercel.app/api?type=waving&color=0:7c3aed,50:4f46e5,100:1d4ed8&height=120&section=footer&animation=fadeIn)

**🤟 Empowering the Deaf and Hard-of-Hearing Community through Accessible AI.**

[![Star](https://img.shields.io/badge/⭐%20Star%20this%20repo-if%20it%20helped!-1d4ed8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/souravbiswas35/Bangla-Sign-Language-Recognition_Ishara)

</div>

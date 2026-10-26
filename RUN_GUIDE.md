# 🚀 How to Run Backend & Frontend (FYDP-3 Bangla Sign Language AI)

This guide provides step-by-step instructions for running the **FastAPI Backend** and the **Vite + React Frontend** on PC/Laptop and mobile devices.

---

## 📋 Prerequisites Check (সিস্টেমের প্রয়োজনীয় সফটওয়্যার)

সার্ভার দুটি চলার জন্য আপনার পিসিতে নিচের ২টি সফটওয়্যার ইনস্টল থাকতে হবে:

1. **Python 3.11 (64-bit)** *(বাধ্যতামূলক — TensorFlow 2.18 শুধুমাত্র Python 3.9–3.12 সমর্থন করে; Python 3.14 সমর্থন করে না)*
   - 🔗 সরাসরি ডাউনলোড লিঙ্ক: [Python 3.11.9 64-bit Installer](https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe)
   - ⚠️ **গুরুত্বপূর্ণ**: ইনস্টল করার সময় প্রথম স্ক্রিনের নিচে **`[x] Add python.exe to PATH`** বক্সে অবশ্যই টিক চিহ্ন দেবেন।

2. **Node.js (LTS Version)** *(ফ্রন্টএন্ডের জন্য)*
   - 🔗 সরাসরি ডাউনলোড লিঙ্ক: [Node.js Official Website](https://nodejs.org/) (LTS সংস্করণটি ডাউনলোড করুন)
   - ইনস্টল করার সময় ডিফল্ট সেটিংস রাখুন (Ensure "Add to PATH" is enabled).

---

## ⚡ Method 1: One-Click Launch (Recommended for Windows)

The project includes pre-configured batch scripts in the root directory:

1. **Start Backend**:
   - Double-click [`run_backend.bat`](file:///d:/All%20Projects/FYDP-3/run_backend.bat)
   - Wait until you see: `Uvicorn running on http://0.0.0.0:8000`

2. **Start Frontend**:
   - Double-click [`run_frontend.bat`](file:///d:/All%20Projects/FYDP-3/run_frontend.bat)
   - Wait until you see: `Local: https://localhost:5173/`

3. **Open in Browser**:
   - Navigate to **`https://localhost:5173`** (or `http://localhost:5173`)
   - Grant camera permissions when prompted.

---

## 💻 Method 2: Manual Terminal Startup (Command Prompt / PowerShell)

### Step 1: Start the Backend (FastAPI + WebSockets)

1. Open a new terminal window / PowerShell.
2. Navigate to the `backend` folder:
   ```powershell
   cd "d:\All Projects\FYDP-3\backend"
   ```
3. Create a dedicated virtual environment with **Python 3.11** or **Python 3.12**:
   ```powershell
   py -3.11 -m venv venv
   ```
   *(If using Python 3.12, run: `py -3.12 -m venv venv`)*

4. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\activate
   ```
   *(You will see `(venv)` appear at the start of your terminal line).*

5. Install dependencies inside the virtual environment:
   ```powershell
   pip install -r requirements.txt
   ```
6. Start the FastAPI server:
   ```powershell
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
7. **Verify**:
   - Backend API URL: [http://localhost:8000](http://localhost:8000)
   - Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Models endpoint: [http://localhost:8000/api/models](http://localhost:8000/api/models)

---

### Step 2: Start the Frontend (React 19 + Vite)

1. Open a **second** terminal window / PowerShell.
2. Navigate to the `frontend` folder:
   ```powershell
   cd "d:\All Projects\FYDP-3\frontend"
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
4. **Verify**:
   - Open [https://localhost:5173](https://localhost:5173) in Chrome, Edge, or Firefox.
   - If using HTTPS with self-signed certificate, click **"Advanced" ➔ "Proceed to localhost"**.

---

## 📱 How to Run and Test on Mobile Phone / Tablet

The Vite server is configured with `host: 0.0.0.0` and basic SSL so you can test directly on your smartphone:

1. Connect your phone and PC to the **same Wi-Fi network**.
2. Find your PC's local IP address (in PowerShell, run `ipconfig`, look for `IPv4 Address`, e.g., `192.168.1.15`).
3. Open your mobile browser (Chrome / Safari) and navigate to:
   ```text
   https://<YOUR_PC_IP>:5173
   ```
4. Accept the browser security certificate warning (**Advanced ➔ Proceed**).
5. Tap **"Start Camera"** and use the **"Flip Camera"** button to toggle between front and rear cameras.

---

## 🧪 Testing Features on the Website

1. **Theme Toggle**: Click the **Sun / Moon** icon in the header to switch between Dark and Light mode.
2. **Emblem Logo**: Displays your official AI Sign Language Logo with responsive scaling.
3. **Sign Gesture Recognition**:
   - Position yourself inside the dashed silhouette guide.
   - Click **"Perform Sign (Spacebar)"** (or press the `Spacebar` key).
   - Perform any of the 100 Bangla signs during the 3.0s window.
   - The AI will return the recognized Bangla word, English translation, and probability ranking.
4. **Sentence Builder**:
   - Click **"Add Word"** to append words into a continuous sentence.
   - Click **"Read Aloud"** to listen to the Bengali Text-to-Speech (TTS) pronunciation.
   - Click **"Copy"** to copy the constructed sentence to your clipboard.
5. **100-Class Dictionary**:
   - Click **"100 Classes Dictionary"** in the header to search and browse all 100 trained signs with category filters and audio pronunciation.
6. **Benchmark Video Test**:
   - Switch to the **"Benchmark Dataset Video Test"** tab to drag and drop sample MP4 dataset videos to test 94.3% accuracy without needing a webcam.

---

## 🛠️ Common Troubleshooting

| Issue | Cause & Solution |
| :--- | :--- |
| **`No matching distribution found for tensorflow`** | **Cause**: You are running Python 3.14. TensorFlow only supports Python 3.10–3.12.<br>**Fix**: Install Python 3.11 (`winget install Python.Python.3.11`) and create a venv: `py -3.11 -m venv venv`. |
| **`npm is not recognized`** | **Cause**: Node.js is not in your system PATH.<br>**Fix**: Install Node.js (LTS version) from [nodejs.org](https://nodejs.org). |
| **`Models not detected`** | Ensure the `.h5` / `.keras` weights and `feature_scaler.pkl` are present in `backend/models/`. |
| **Camera access denied** | Check browser permissions: click the lock/tune icon beside the URL in your browser and allow **Camera** permissions. |
| **Port 8000 already in use** | Terminate existing uvicorn processes or run on another port with `--port 8001`. |

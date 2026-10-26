# 🌐 Free Cloud Deployment Guide (FYDP-3 Bangla Sign Language AI)

This guide provides complete, step-by-step instructions to deploy your project **100% free** on the cloud:
* **Backend (FastAPI + WebSockets + TensorFlow Models)** $\rightarrow$ **[Render.com](https://render.com/)** or **[Railway.app](https://railway.app/)**
* **Frontend (React + Vite + MediaPipe + Camera)** $\rightarrow$ **[Vercel](https://vercel.com/)**

---

## 📌 Architecture Overview

```
                                  ┌───────────────────────────┐
                                  │       User's Device       │
                                  │ (Mobile / Laptop Camera)  │
                                  └─────────────┬─────────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     │                                                     │
                     ▼                                                     ▼
        ┌─────────────────────────┐                           ┌─────────────────────────┐
        │   Vercel (Frontend)     │                           │    Render (Backend)     │
        │ https://your-app.vercel │                           │ https://your-backend    │
        │          .app           │                           │      .onrender.com      │
        ├─────────────────────────┤                           ├─────────────────────────┤
        │ • React 19 + Vite       │                           │ • FastAPI + WebSockets  │
        │ • MediaPipe Landmark    │ ── WebSocket (wss://) ──> │ • TensorFlow Models     │
        │   Extraction (Client)   │ <── Predictions (JSON) ── │   (Transformer, GRU)   │
        │ • Authentic Bangla TTS  │                           │ • Feature Scaler        │
        └─────────────────────────┘                           └─────────────────────────┘
```

---

## 🚀 Step 1: Push Project to GitHub

If your project is not already on GitHub:

1. Open terminal in the project root:
   ```powershell
   cd "d:\All Projects\FYDP-3"
   ```
2. Initialize and commit:
   ```powershell
   git init
   git add .
   git commit -m "feat: complete 225-D bangla sign language system ready for deployment"
   ```
3. Create a new repository on [GitHub](https://github.com/new) (e.g. `FYDP-Bangla-Sign-Language`).
4. Link and push:
   ```powershell
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/FYDP-Bangla-Sign-Language.git
   git push -u origin main
   ```

*(Note: The models in `backend/models/` total ~25MB, well below GitHub's 100MB limit, so they push cleanly without needing Git LFS).*

---

## 🖥️ Step 2: Deploy Backend on Render (Free)

[Render.com](https://render.com) provides free cloud hosting with native WebSocket and Python support.

### Option A: Standard Web Service (Quickest)
1. Sign in to **[Render Dashboard](https://dashboard.render.com/)** (sign up with GitHub).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repo.
4. Fill in the service configuration:
   * **Name**: `bangla-sign-backend` (or your chosen name)
   * **Region**: Choose closest (e.g., `Singapore` or `Frankfurt`)
   * **Root Directory**: `backend`
   * **Runtime**: `Python 3`
   * **Build Command**:
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt
     ```
   * **Start Command**:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   * **Instance Type**: **Free**
5. Under **Environment Variables**, click **Add Environment Variable**:
   * Key: `PYTHON_VERSION`
   * Value: `3.11.9`
6. Click **Deploy Web Service**.
7. Wait 2–3 minutes. Once deployment finishes, Render will give you a live URL:
   * Example: `https://bangla-sign-backend.onrender.com`
   * Test it by visiting: `https://bangla-sign-backend.onrender.com/health` in your browser. It should return `{"status": "ok", ...}`.

---

## 🎨 Step 3: Deploy Frontend on Vercel (Free)

[Vercel](https://vercel.com/) gives instant global CDN hosting and **free HTTPS** (vital for camera access on mobile devices).

1. Sign in to **[Vercel Dashboard](https://vercel.com/)** (sign up with GitHub).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository.
4. Configure the project settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: Click **Edit** and select **`frontend`**
   * **Build Command**: `npm run build` (default)
   * **Output Directory**: `dist` (default)
5. Expand **Environment Variables** and add:
   * **Key**: `VITE_BACKEND_URL`
   * **Value**: Your Render Backend URL (e.g., `https://bangla-sign-backend.onrender.com`)
   *(Do NOT add a trailing slash `/` at the end).*
6. Click **Deploy**.
7. In ~1 minute, Vercel will give you a production HTTPS URL:
   * Example: `https://bangla-sign-language.vercel.app`

---

## 📱 Step 4: Test & Present Live

1. Open your Vercel URL on any **Laptop, Desktop, iPhone, or Android Phone**.
2. Tap **Allow** when the browser asks for Camera permission.
3. Observe:
   * Continuous live streaming recognition on the left.
   * Real-time Bengali text prediction and top-5 probability bars.
   * Bengali text-to-speech pronunciation.
   * Mobile-friendly HUD without needing to scroll.

---

## 💡 Troubleshooting & Tips

* **Render Free Tier Spin-down**:
  Render free services go to sleep after 15 minutes of inactivity. When you open the frontend, the first request may take ~30–50 seconds to wake the backend up. You can keep it warm by visiting the `/health` endpoint before a presentation.
* **Camera on Mobile**:
  Mobile browsers (Chrome / Safari) strictly block camera access over HTTP. Because Vercel serves the frontend over HTTPS, your camera works automatically on all phones.
* **CORS**:
  The backend is pre-configured with `CORS_ORIGINS = ["*"]` so requests from Vercel are accepted immediately.

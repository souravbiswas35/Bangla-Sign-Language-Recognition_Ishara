# 📋 FYDP-3 Batch Scripts User Guide (সহজ নির্দেশিকা)

This document explains the **3 One-Click `.bat` scripts** created in the root folder of **FYDP-3**, what each script does under the hood, and how to run or clean the project.

এই ডকুমেন্টে ৩টি ব্যাচ স্ক্রিপ্টের কাজ, চালানোর ৩টি সহজ উপায় এবং প্রজেক্ট ক্লিন করার নিয়ম বিস্তারিত লেখা আছে।

---

## 📌 Quick Overview (এক নজরে ৩টি স্ক্রিপ্ট)

| Script | Purpose (উদ্দেশ্য) | When to click? (কখন চালাবেন?) |
| :--- | :--- | :--- |
| 🟢 [`run_backend.bat`](file:///d:/All%20Projects/FYDP-3/run_backend.bat) | Starts the AI & FastAPI Backend Server | প্রজেক্ট রান করার শুরুতে AI ব্যাকএন্ড চালু করতে |
| 🔵 [`run_frontend.bat`](file:///d:/All%20Projects/FYDP-3/run_frontend.bat) | Starts the React & Vite Web Interface | ক্যামেরা ও ওয়েব ইন্টারফেস চালু করতে |
| 🧹 [`clean_project.bat`](file:///d:/All%20Projects/FYDP-3/clean_project.bat) | Cleans temporary cache & shrinks folder to minimum | ফাইল কাউকে পাঠাতে, জিপ করতে বা ড্রাইভ খালি করতে |

---

## 🚀 এখন যেভাবে খুব সহজে চালাবেন (৩টি উপায়)

### উপায় ১: সরাসরি ডাবল-ক্লিক করুন (সবচেয়ে সহজ)
যেহেতু ইন্টারনেটের ব্লক ট্যাগ সরিয়ে দেওয়া হয়েছে:
1. [**`run_backend.bat`**](file:///d:/All%20Projects/FYDP-3/run_backend.bat) ফাইলে ডাবল-ক্লিক করুন। (কালো উইন্ডো ওপেন হয়ে ব্যাকএন্ড চালু হবে)।
2. এরপর [**`run_frontend.bat`**](file:///d:/All%20Projects/FYDP-3/run_frontend.bat) ফাইলে ডাবল-ক্লিক করুন। (ব্রাউজারে UI ওপেন হবে)।

---

### উপায় ২: ফাইল প্রোপার্টিজ থেকে পারমিশন দেওয়া (যদি উইন্ডোজ আটকায়)
যদি Windows Smart App Control ফাইলটি ব্লক করে, তাহলে:
1. [**`run_backend.bat`**](file:///d:/All%20Projects/FYDP-3/run_backend.bat) ফাইলের ওপর **Right-Click** করে **Properties**-এ ক্লিক করুন।
2. একদম নিচে `Security` সেকশনে একটি চেকবক্স দেখতে পাবেন: **Unblock** (আনব্লক)।
3. **Unblock** বক্সে টিক চিহ্ন (✔) দিন এবং **Apply** $\rightarrow$ **OK** চাপুন।
4. একইভাবে [**`run_frontend.bat`**](file:///d:/All%20Projects/FYDP-3/run_frontend.bat) এবং [**`clean_project.bat`**](file:///d:/All%20Projects/FYDP-3/clean_project.bat) ফাইলেও করে নিন।

---

### উপায় ৩: টার্মিনাল / PowerShell থেকে সরাসরি রান করা (সবচেয়ে নির্ভরযোগ্য)
Smart App Control বা উইন্ডোজ কখনোই টার্মিনালে কোনো স্ক্রিপ্টকে ব্লক করে না।

1. আপনার কোড এডিটর (VS Code) বা উইন্ডোজের **PowerShell / CMD** ওপেন করুন।
2. **ব্যাকএন্ড চালু করতে** নিচের কমান্ডটি লিখে <kbd>Enter</kbd> চাপুন:
   ```powershell
   cd "D:\All Projects\FYDP-3"
   .\run_backend.bat
   ```
3. **ফ্রন্টএন্ড চালু করতে** আরেকটি টার্মিনাল ট্যাব বা উইন্ডোতে লিখুন:
   ```powershell
   cd "D:\All Projects\FYDP-3"
   .\run_frontend.bat
   ```

---

## 🧹 কীভাবে প্রজেক্ট ক্লিন (ছোট/Shrink) করবেন

কাজ শেষ হলে বা কাউকে প্রজেক্টটি পাঠাতে চাইলে ফোল্ডারের সাইজ **১৫–২০ MB** বানিয়ে ফেলার নিয়ম:

### পদ্ধতি ১: ১-ক্লিকে ক্লিন (ডাবল-ক্লিক)
* সরাসরি [**`clean_project.bat`**](file:///d:/All%20Projects/FYDP-3/clean_project.bat) ফাইলে ডাবল-ক্লিক করুন।
* এটি স্বয়ংক্রিয়ভাবে সমস্ত ভারী ক্যাশ ও টেম্পোরারি ফাইল ডিলিট করে দিয়ে প্রজেক্টকে একদম ছোট সাইজে নিয়ে আসবে।

### পদ্ধতি ২: টার্মিনাল থেকে ক্লিন
* টার্মিনাল বা PowerShell-এ নিচের কমান্ডটি দিন:
  ```powershell
  cd "D:\All Projects\FYDP-3"
  .\clean_project.bat
  ```

---

## 🔍 স্ক্রিপ্টগুলোর ভেতরের কাজের বিবরণ

### 1. 🟢 `run_backend.bat` (AI Backend Launcher)
* **Health Check**: প্রথমে চেক করে `backend/venv` ঠিক আছে কি না।
* **Auto-Install**: যদি কোনো কারণে `venv` মিসিং বা নষ্ট থাকে, এটি স্বয়ংক্রিয়ভাবে একটি নতুন পরিবেশ তৈরি করে এবং `requirements.txt` থেকে প্রয়োজনীয় প্যাকেজ ইনস্টল করে।
* **C-Drive Protection**: প্যাকেজ ডাউনলোডের সময় `--no-cache-dir` ব্যবহার করে, যাতে আপনার **C: ড্রাইভের স্পেস একটুও নষ্ট না হয়**।
* **Server Launch**: সব প্রস্তুত হলে FastAPI সার্ভার চালু করে: `http://127.0.0.1:8000`.

### 2. 🔵 `run_frontend.bat` (Web UI Launcher)
* **Dependency Check**: চেক করে `frontend/node_modules` ফোল্ডার আছে কি না।
* **Auto-Install**: যদি `node_modules` মিসিং থাকে, এটি নিজে থেকেই `npm install` চালিয়ে দেয়।
* **Vite Server**: ফ্রন্টএন্ড ডেভেলপমেন্ট সার্ভার চালু করে।

### 3. 🧹 `clean_project.bat` (Storage Cleaner & Minifier)
* **যা যা ডিলিট করে**:
  - `backend/venv` (ভারী পাইথন লাইব্রেরি ফোল্ডার)
  - `frontend/node_modules` (নোড প্যাকেজ ফোল্ডার)
  - `frontend/dist` (বিল্ড ফাইল)
  - পাইথনের `__pycache__` ফোল্ডারসমূহ
  - C: ড্রাইভের পুরনো `pip cache` (যদি থাকে)
* **যা ১০০% নিরাপদ থাকে**:
  - ✅ আপনার লেখা সমস্ত কোড (`.py`, `.jsx`, `.js`, `.css`)
  - ✅ ট্রেইন করা এআই মডেল ও ওয়েটস (`backend/models/`)
  - ✅ কনফিগারেশন ও ডেটা ফাইল

---

## ❓ Frequently Asked Questions (সাধারণ প্রশ্নোত্তর)

### ১. কোড রান করার পর সাইজ কেন একটু বাড়ে?
> **উত্তর:** কোড চালানোর জন্য পাইথন ও রিঅ্যাক্টকে কিছু লাইব্রেরি ফাইল মেমোরিতে রাখতে হয়। তাই কোড চলাকালীন সাইজ কিছুটা বাড়ে। কাজ শেষ হলে [`clean_project.bat`](file:///d:/All%20Projects/FYDP-3/clean_project.bat) ডাবল-ক্লিক করলেই ফোল্ডার আবার ছোট হয়ে যায়।

### ২. আমার C: ড্রাইভ কি ভরে যাবে?
> **উত্তর:** না। সমস্ত ইনস্টলেশন এবং লাইব্রেরি শুধু `D:\All Projects\FYDP-3` ফোল্ডারের ভেতরেই থাকে। C: ড্রাইভের সুরক্ষায় pip cache সম্পূর্ণ বন্ধ রাখা হয়েছে।

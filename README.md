# Ancient Building Style Transfer & Restoration

> **A Generative AI project for restoring and reimagining broken ancient architectures using Stable Diffusion.**  


---

## 📘 Overview

This project implements **image style transfer** and **inpainting-based restoration** for ancient buildings using **Stable Diffusion** models.  
It combines **deep learning**, **generative art**, and **image restoration techniques** to recreate lost details in historical architecture.

You can:
- 🎨 Generate artistic ancient building reconstructions  
- 🧱 Restore damaged or missing areas in old architecture photos  
- 🌐 Deploy the model via Flask + Ngrok for remote inference  

---

## 🧠 Key Features

✅ **Style Transfer** – Generate new visual interpretations of ancient structures  
✅ **Inpainting Restoration** – Repair broken or missing image areas  
✅ **Flask Web API** – Serve model outputs through a simple web service  
✅ **GPU Acceleration** – Automatically detects CUDA for faster inference  

---

## ⚙️ Environment Setup

### 1️⃣ Install Dependencies
```bash
pip install torch torchvision transformers diffusers --upgrade
pip install flask flask-cors pyngrok pillow


### 2️⃣ Authenticate Hugging Face

Before running the notebook, replace the placeholder with your own token:

```python
YOUR_HF_TOKEN = "your_huggingface_token_here"


## 🌐 Run Flask API
```bash
python app.py




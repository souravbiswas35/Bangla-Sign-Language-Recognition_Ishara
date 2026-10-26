# Use official slim Python 3.11 image (supported by TensorFlow 2.18)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install Linux system dependencies for OpenCV & MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application files and models
COPY . .

# Expose default port
EXPOSE 8000

# Start Uvicorn bound to dynamic cloud $PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]

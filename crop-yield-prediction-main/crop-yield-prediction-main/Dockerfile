FROM python:3.12-slim

WORKDIR /app

# Install system libraries required by OpenCV/Ultralytics
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libxcb1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV APP_HOST=0.0.0.0
# Render injects PORT; map to APP_PORT for pydantic settings
CMD sh -c "export APP_PORT=${PORT:-5000} && python main.py"
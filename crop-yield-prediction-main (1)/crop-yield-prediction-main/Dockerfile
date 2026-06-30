FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV APP_HOST=0.0.0.0
# Render injects PORT; map to APP_PORT for pydantic settings
CMD sh -c "export APP_PORT=${PORT:-8000} && python main.py"
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for image processing
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the model during build
RUN python -c "from rembg import new_session; new_session('isnet-general-use')"

# Copy application code
COPY src/ ./src/

# Expose port
EXPOSE 8001

# Run the server
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]

# ------------------------------------------------------------------------------
# Dockerfile for Transcription Backend (Optimized & Fixed)
# ------------------------------------------------------------------------------

# 1) Global ARG for base image tag
ARG PYTHON_IMAGE=python:3.12-slim-bookworm

# 2) Builder stage: install build deps & Python packages
FROM ${PYTHON_IMAGE} AS builder
WORKDIR /app

# Install system-wide build dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        build-essential \
        ffmpeg \
        curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install into a custom prefix for caching
COPY requirements.txt ./
RUN pip install --no-cache-dir --prefix /install -r requirements.txt

# Copy application source
COPY . .

# ------------------------------------------------------------------------------
# 3) Runtime stage: create non-root user & set up environment
# ------------------------------------------------------------------------------
FROM ${PYTHON_IMAGE}

# Create a dedicated non-root user
RUN groupadd -r appuser \
    && useradd -r -g appuser -d /home/appuser -s /bin/bash appuser \
    && mkdir -p /home/appuser /app \
    && chown -R appuser:appuser /home/appuser /app

WORKDIR /app

# Install only runtime dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages into system prefix
COPY --from=builder /install /usr/local

# Copy application code with proper ownership
COPY --chown=appuser:appuser . .

# Configure environment variables (key=value syntax)
ENV PATH=/usr/local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONFAULTHANDLER=1

# Clean up compiled Python bytecode
RUN find /app -type d -name '__pycache__' -exec rm -rf {} + \
    && find /app -type f -name '*.pyc' -delete \
    && find /app -type f -name '*.pyo' -delete

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8001

# Healthcheck to verify service readiness
HEALTHCHECK --interval=30s --timeout=5s \
    CMD curl -f http://localhost:8001/health || exit 1

# Launch Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
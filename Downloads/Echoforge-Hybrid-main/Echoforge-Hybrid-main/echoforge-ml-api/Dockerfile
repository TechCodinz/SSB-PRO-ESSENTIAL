FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn==21.2.0

# Copy application
COPY . .

# Ensure local core/ and detectors are importable
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Run behind gunicorn with uvicorn workers for production
# Use env to control workers/timeouts to fit memory limits
ENV WORKERS=1
ENV TIMEOUT=60
CMD ["/bin/sh", "-c", "gunicorn main:app -k uvicorn.workers.UvicornWorker -w ${WORKERS:-1} -b 0.0.0.0:8000 --timeout ${TIMEOUT:-60}"]

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .
COPY onyx_client.py .
COPY static/ ./static/

# Expose port
EXPOSE 3978

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "3978"]

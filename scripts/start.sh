#!/bin/bash

# Horns Sentinel Demo - Start Script
# Starts all demo services using Docker Compose

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "🚀 Starting Horns Sentinel Demo Environment..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please configure ONYX_API_URL if needed."
    echo ""
fi

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Onyx connection info
echo "📡 HornsIQ will connect to Onyx at: ${ONYX_API_URL:-http://192.168.1.160:8080}"
echo ""

# Start services
echo "📦 Building and starting services..."
docker compose up -d --build

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check service health
echo ""
echo "🔍 Checking service health..."

# Check API
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo "✅ API Server:  http://localhost:8001 (healthy)"
else
    echo "❌ API Server:  http://localhost:8001 (not responding)"
fi

# Check Dashboard
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ Dashboard:   http://localhost:3002 (healthy)"
else
    echo "⏳ Dashboard:   http://localhost:3002 (starting...)"
fi

# Check HornsIQ
if curl -s http://localhost:3979/health > /dev/null 2>&1; then
    echo "✅ HornsIQ:     http://localhost:3979 (healthy)"
else
    echo "❌ HornsIQ:     http://localhost:3979 (not responding)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Horns Sentinel Demo is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Dashboard:  http://localhost:3002"
echo "🤖 HornsIQ:    http://localhost:3979"
echo "🔌 API:        http://localhost:8001"
echo "📚 API Docs:   http://localhost:8001/docs"
echo ""
echo "📝 View logs:  docker compose logs -f"
echo "🛑 Stop demo:  ./scripts/stop.sh"
echo ""
echo "💡 Demo Scenario: Acme Corporation (Security Score: 72/100)"
echo "   - 847 monitored assets"
echo "   - 15 active alerts (2 critical)"
echo "   - 20 vulnerabilities tracked"
echo ""

# Optional: Open browser (uncomment if desired)
# if command -v xdg-open > /dev/null; then
#     xdg-open http://localhost:3000
# elif command -v open > /dev/null; then
#     open http://localhost:3000
# fi

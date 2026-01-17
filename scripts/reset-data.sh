#!/bin/bash

# Horns Sentinel Demo - Reset Data Script
# Resets demo to fresh state

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "🔄 Resetting Horns Sentinel Demo to fresh state..."
echo ""

# Stop services
echo "🛑 Stopping services..."
docker-compose down

# Remove volumes
echo "🗑️  Removing volumes..."
docker-compose down -v

# Clean build cache
echo "🧹 Cleaning build cache..."
docker-compose build --no-cache

echo ""
echo "✅ Demo reset complete!"
echo ""
echo "🚀 Start fresh demo: ./scripts/start.sh"
echo ""

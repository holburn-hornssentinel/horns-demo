#!/bin/bash

# Horns Sentinel Demo - Stop Script
# Stops all demo services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "🛑 Stopping Horns Sentinel Demo Environment..."
echo ""

# Stop services
docker-compose down

echo ""
echo "✅ All services stopped."
echo ""
echo "💡 To start again: ./scripts/start.sh"
echo "🗑️  To remove volumes: docker-compose down -v"
echo ""

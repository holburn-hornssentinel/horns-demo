#!/bin/bash

# Horns Agent - Standalone Demo Script
# Runs the agent in standalone mode for demonstrations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AGENT_DIR="$PROJECT_ROOT/horns-agent"
CONFIG_FILE="$AGENT_DIR/configs/standalone.yaml"
OUTPUT_DIR="$AGENT_DIR/demo-output"

cd "$PROJECT_ROOT"

echo "🤖 Starting Horns Agent in Standalone Mode..."
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Check if agent binary exists
AGENT_BINARY=""
if [ -f "$AGENT_DIR/horns-agent" ]; then
    AGENT_BINARY="$AGENT_DIR/horns-agent"
elif [ -f "/home/horns/horns-agent/build/horns-agent" ]; then
    AGENT_BINARY="/home/horns/horns-agent/build/horns-agent"
    echo "📍 Using agent from: /home/horns/horns-agent/build/horns-agent"
else
    echo "❌ Error: horns-agent binary not found!"
    echo ""
    echo "Expected locations:"
    echo "  1. $AGENT_DIR/horns-agent"
    echo "  2. /home/horns/horns-agent/build/horns-agent"
    echo ""
    echo "💡 To create a mock agent output for demo:"
    echo "   ./scripts/mock-agent-data.sh"
    exit 1
fi

echo "📝 Configuration: $CONFIG_FILE"
echo "📁 Output Directory: $OUTPUT_DIR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting agent..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Deployment Mode: Standalone (Air-gapped)"
echo "   Data Flow: Agent → Local Files"
echo "   Network: None (completely isolated)"
echo ""
echo "📊 Agent will write data to: $OUTPUT_DIR"
echo ""
echo "Press Ctrl+C to stop the agent"
echo ""

# Run agent
"$AGENT_BINARY" run --config "$CONFIG_FILE"

#!/bin/bash

# Mock Agent Data Generator
# Creates sample agent output for demo purposes when real agent is not available

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_ROOT/horns-agent/demo-output"

mkdir -p "$OUTPUT_DIR"

echo "🎭 Generating mock agent data for demo..."
echo ""

# Generate system metrics
cat > "$OUTPUT_DIR/metrics-$(date +%s).json" << 'EOF'
{
  "timestamp": "2026-01-17T15:42:33Z",
  "agent": {
    "name": "acme-prod-01",
    "version": "1.2.4",
    "hostname": "acme-web-01.production.acme.local"
  },
  "system": {
    "cpu_usage": 34.2,
    "memory_usage": 62.8,
    "disk_usage": 45.1,
    "uptime": 2592000,
    "load_average": [1.2, 1.5, 1.3]
  },
  "network": {
    "rx_bytes": 1048576000,
    "tx_bytes": 524288000,
    "connections": 42
  },
  "processes": {
    "total": 156,
    "running": 3,
    "sleeping": 153
  },
  "docker": {
    "containers_running": 8,
    "containers_total": 12,
    "images": 45
  }
}
EOF

# Generate security events
cat > "$OUTPUT_DIR/security-events-$(date +%s).json" << 'EOF'
{
  "timestamp": "2026-01-17T15:42:33Z",
  "agent": "acme-prod-01",
  "events": [
    {
      "type": "vulnerability_scan",
      "severity": "medium",
      "description": "Outdated package detected: openssl 1.1.1f",
      "cve": "CVE-2023-XXXXX"
    },
    {
      "type": "file_integrity",
      "severity": "info",
      "description": "Configuration file modified: /etc/nginx/nginx.conf"
    },
    {
      "type": "network_connection",
      "severity": "low",
      "description": "New outbound connection to 8.8.8.8:53"
    }
  ]
}
EOF

# Generate log
cat > "$OUTPUT_DIR/agent.log" << 'EOF'
2026-01-17T15:40:00Z INFO Starting Horns Agent (standalone mode)
2026-01-17T15:40:00Z INFO Configuration loaded: standalone.yaml
2026-01-17T15:40:01Z INFO Stockyard module: initialized
2026-01-17T15:40:01Z INFO Sentinel module: initialized
2026-01-17T15:40:01Z INFO Backend: local file output
2026-01-17T15:40:01Z INFO Output directory: ./horns-agent/demo-output
2026-01-17T15:40:30Z INFO Collected system metrics
2026-01-17T15:40:30Z INFO Wrote metrics to file
2026-01-17T15:41:00Z INFO Security scan complete: 3 events
2026-01-17T15:41:00Z INFO Wrote security events to file
2026-01-17T15:42:00Z INFO Docker container scan: 8 running containers
2026-01-17T15:42:33Z INFO Agent healthy, memory usage: 124MB
EOF

echo "✅ Mock agent data generated!"
echo ""
echo "📁 Output directory: $OUTPUT_DIR"
echo ""
echo "📊 Files created:"
ls -lh "$OUTPUT_DIR"
echo ""
echo "💡 View metrics:   cat $OUTPUT_DIR/metrics-*.json | jq"
echo "💡 View logs:      tail -f $OUTPUT_DIR/agent.log"
echo ""

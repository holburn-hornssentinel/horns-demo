# Horns Sentinel Demo Environment

**Demo-ready standalone environment for Quilr interview (Jan 21, 2026)**

## Quick Start

```bash
# Start all services
./scripts/start.sh

# Access the services
Dashboard:  http://localhost:3000
HornsIQ:    http://localhost:3978
API:        http://localhost:8000
```

## What's Included

- **Sentinel Dashboard** - Next.js security dashboard with real-time threat monitoring
- **HornsIQ Web Chat** - AI-powered security assistant powered by Onyx
- **Demo API Server** - FastAPI service serving demo security data
- **Horns Agent** - Deployment model demonstrations (SaaS, On-Premise, Air-gapped)

## Architecture

This demo showcases a complete security operations platform:

1. **Agent Layer** - Lightweight Go binaries deployed on customer infrastructure
2. **Data Layer** - Secure ingestion and processing pipeline
3. **Intelligence Layer** - AI-powered threat analysis and recommendations
4. **Presentation Layer** - Dashboard and chat interface

## Demo Scenario

**Acme Corporation** - Mid-size tech company with 847 monitored assets
- Security Score: 72/100
- 15 active alerts (2 critical)
- 20 vulnerabilities tracked
- OSINT monitoring active

## Services

### Sentinel Dashboard (Port 3000)
- Overview page with security metrics
- Alert management and investigation
- Threat intelligence (CVEs, IOCs)
- OSINT findings (credential leaks, dark web)
- Brand monitoring
- Agent fleet management

### HornsIQ Chat (Port 3978)
- Natural language security queries
- Connected to Onyx knowledge base
- Supports multiple personas
- Context-aware responses

### API Server (Port 8000)
- `/api/alerts` - Security alerts
- `/api/vulnerabilities` - CVE data
- `/api/threats` - Threat intelligence
- `/api/osint` - OSINT findings
- `/api/agents` - Agent status

## Deployment Models

Horns Agent supports three deployment architectures:

1. **SaaS Mode** - Agent → Cloud Platform
   - Zero infrastructure for customer
   - Best for SMB customers

2. **On-Premise Mode** - Agent → Customer Gateway → Platform
   - Data stays in customer network
   - For regulated industries (healthcare, finance)

3. **Air-Gapped Mode** - Agent → Local Files
   - Complete network isolation
   - For high-security environments

See `docs/DEPLOYMENT_MODELS.md` for details.

## Management Scripts

```bash
./scripts/start.sh          # Start all demo services
./scripts/stop.sh           # Stop all services
./scripts/reset-data.sh     # Reset to fresh demo state
./scripts/start-agent.sh    # Run agent in standalone mode
```

## Demo Flow

1. **Discovery** (15 min) - Understand customer needs
2. **Dashboard Demo** (20 min) - Show threat monitoring capabilities
3. **HornsIQ Demo** (15 min) - Demonstrate AI-powered assistance
4. **Agent Demo** (5 min) - Show deployment flexibility
5. **Q&A + Live Build** (15-20 min)

See `docs/DEMO_SCRIPT.md` for detailed talking points.

## Requirements

- Docker & Docker Compose
- Node.js 18+ (for dashboard development)
- Python 3.11+ (for API services)
- Access to Onyx instance on welcometocostco

## Backup Plans

If something fails during the demo:
- HornsIQ offline → Use Teams recording or cached responses
- Dashboard issues → Fall back to production instance
- Network issues → Everything runs locally
- See `docs/BACKUP_PLANS.md` for complete contingency plans

## Post-Interview

This is a standalone demo environment. After the interview:
```bash
./scripts/stop.sh
cd /home/horns
rm -rf horns-demo  # Clean removal if desired
```

---

**Built with:** Next.js, FastAPI, Docker, Onyx AI
**Interview:** Jan 21, 2026 @ 2:00 PM EST

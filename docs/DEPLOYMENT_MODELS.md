# Horns Agent Deployment Models

## Overview

Horns Sentinel supports three distinct deployment architectures to meet different security, compliance, and operational requirements. This document provides deep technical detail on each model.

---

## Deployment Model Comparison

| Aspect | SaaS | On-Premise | Standalone |
|--------|------|------------|------------|
| **Data Location** | Horns Cloud (AWS) | Customer network | Local machine |
| **Network Required** | Yes (outbound HTTPS) | Yes (internal only) | No |
| **Setup Time** | < 30 minutes | 1-2 weeks | < 5 minutes |
| **Infrastructure Cost** | None | Gateway + storage | None |
| **Updates** | Automatic | Semi-automatic | Manual |
| **Compliance** | SOC2, ISO 27001 | Customer-specific | Customer-specific |
| **Best For** | SMB, fast deployment | Enterprise, regulated | Demos, air-gapped |
| **Cost Model** | Per agent SaaS fee | License + support | License only |

---

## 1. SaaS Mode

### Architecture

```
┌─────────────┐                    ┌──────────────────┐
│   Agent     │ ─── TLS 1.3 ───>  │  Horns Cloud     │
│ (Customer)  │   WebSocket        │  (AWS)           │
└─────────────┘                    └──────────────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │   Dashboard      │
                                   │  (Web UI)        │
                                   └──────────────────┘
```

### Technical Details

**Network Communication:**
- Protocol: WebSocket over TLS 1.3
- Endpoint: `wss://agents.hornssentinel.cloud`
- Port: 443 (outbound only)
- Firewall requirements: Allow outbound HTTPS to `*.hornssentinel.cloud`

**Authentication:**
- API key authentication (HMAC-SHA256)
- Keys rotate every 90 days
- Revocation supported via dashboard

**Data Transmission:**
- Batched: 100 events per batch or 10-second timeout (whichever comes first)
- Compression: gzip
- Encryption: TLS 1.3 with forward secrecy

**High Availability:**
- Multi-region endpoints (failover automatic)
- Client-side retry with exponential backoff
- Local buffering during cloud unavailability (up to 24 hours)

**Data Retention:**
- Hot storage: 30 days
- Cold storage: 1 year
- Customer-configurable retention policies

### Use Cases

✅ **Best For:**
- Small to medium businesses (50-500 agents)
- Companies without dedicated security infrastructure
- Fast deployment requirements
- Global teams (multi-region agents)
- SaaS-first technology strategy

❌ **Not Ideal For:**
- Highly regulated industries with data sovereignty requirements
- Air-gapped or classified environments
- Extremely sensitive data (trade secrets, classified government, etc.)

### Configuration Example

```yaml
backend:
  type: "saas"
  saas:
    endpoint: "wss://agents.hornssentinel.cloud"
    api_key: "${HORNS_AGENT_API_KEY}"
    region: "us-east-1"

    connection:
      reconnect_interval: "30s"
      heartbeat_interval: "15s"
      timeout: "60s"

    data:
      batch_size: 100
      batch_timeout: "10s"
      compression: "gzip"

    tls:
      verify_server: true
      min_version: "1.3"
```

### Compliance & Security

- **SOC 2 Type II** certified
- **ISO 27001** certified
- **GDPR** compliant (EU region available)
- **HIPAA** eligible (BAA available)
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Regular penetration testing
- Bug bounty program

---

## 2. On-Premise Mode

### Architecture

```
┌─────────────┐         ┌────────────────┐        ┌──────────────┐
│   Agent     │ ─────>  │  Customer      │ ─────> │  Dashboard   │
│ (Prod)      │  mTLS   │  Gateway       │  VPN   │  (Cloud or   │
└─────────────┘         │  (On-Prem)     │        │   On-Prem)   │
                        └────────────────┘        └──────────────┘
                               │
                               ▼
                        ┌────────────────┐
                        │   Customer     │
                        │   Database     │
                        └────────────────┘
```

### Technical Details

**Gateway Component:**
- Docker container or VM
- Requirements: 2 CPU, 4GB RAM, 100GB disk
- Supported platforms: Linux (Ubuntu, RHEL, Debian)
- Handles: Authentication, data aggregation, storage

**Network Communication:**
- Protocol: WebSocket over mutual TLS
- Endpoint: Customer-defined (e.g., `wss://horns-gateway.company.local:8443`)
- Network: Internal only (no internet required)
- Firewall: Allow agents to reach gateway on port 8443

**Authentication:**
- Mutual TLS (mTLS) with client certificates
- Certificate authority managed by customer
- Certificate rotation via automation (Vault, cert-manager, etc.)

**Data Flow:**
1. Agent collects data
2. Agent sends to on-premise gateway (mTLS, internal network)
3. Gateway stores in customer database
4. Dashboard queries gateway (VPN, API, or direct access)
5. **Data never leaves customer network perimeter**

**Database Options:**
- PostgreSQL (recommended)
- MySQL/MariaDB
- Microsoft SQL Server
- Customer-managed or RDS

### Use Cases

✅ **Best For:**
- Financial services (banking, insurance)
- Healthcare (HIPAA compliance)
- Government agencies
- Companies with strict data sovereignty requirements
- Environments with air-gapped production networks

❌ **Not Ideal For:**
- Small teams without infrastructure expertise
- Companies prioritizing speed over control
- Organizations without existing on-premise infrastructure

### Configuration Example

```yaml
backend:
  type: "gateway"
  gateway:
    endpoint: "wss://horns-gateway.acme.local:8443"

    auth:
      type: "mutual_tls"
      client_cert: "/etc/horns-agent/certs/client.crt"
      client_key: "/etc/horns-agent/certs/client.key"
      ca_cert: "/etc/horns-agent/certs/ca.crt"

    connection:
      reconnect_interval: "30s"
      heartbeat_interval: "10s"
      timeout: "30s"

    network:
      allowed_ips:
        - "10.0.0.0/8"     # Internal network
        - "172.16.0.0/12"  # Private subnet

    tls:
      verify_server: true
      min_version: "1.3"

# Local buffering during gateway unavailability
local_buffer:
  enabled: true
  max_size: "10GB"
  retention: "7d"
  path: "/var/horns-agent/buffer"

# Privacy controls
privacy:
  data_masking:
    enabled: true
    patterns:
      - credit_cards
      - ssn
      - passwords
      - api_keys
```

### Gateway Deployment

**Docker Compose:**
```yaml
version: '3.8'

services:
  horns-gateway:
    image: hornssentinel/gateway:latest
    ports:
      - "8443:8443"
    volumes:
      - ./certs:/etc/horns-gateway/certs:ro
      - gateway-data:/var/lib/horns-gateway
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/horns
      - TLS_CERT=/etc/horns-gateway/certs/server.crt
      - TLS_KEY=/etc/horns-gateway/certs/server.key

  postgres:
    image: postgres:15
    volumes:
      - pg-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=horns
      - POSTGRES_USER=horns
      - POSTGRES_PASSWORD=${DB_PASSWORD}

volumes:
  gateway-data:
  pg-data:
```

### Compliance & Security

- **Customer-controlled** compliance posture
- **No data exfiltration** - everything stays on-prem
- **Audit trail** for all data access
- **Customer-managed** encryption keys
- Supports **FIPS 140-2** cryptography
- Compatible with **FedRAMP** requirements

---

## 3. Standalone Mode

### Architecture

```
┌─────────────┐
│   Agent     │
│             │
│  ┌────────┐ │
│  │ Data   │ │──────> Local Files
│  │ Export │ │        (.json, .csv)
│  └────────┘ │
└─────────────┘
     ↓
   Manual Export
     ↓
┌─────────────┐
│  Dashboard  │
│  (Import)   │
└─────────────┘
```

### Technical Details

**Data Output:**
- Format: JSON, CSV, or Parquet
- Location: Configurable output directory
- File rotation: By size or time
- Compression: Optional gzip

**No Network Communication:**
- Agent has zero network connectivity
- All modules run locally
- Data written to local filesystem
- Perfect for air-gapped environments

**Manual Export Process:**
1. Agent writes data to local files
2. Administrator reviews/redacts if needed
3. Files copied to removable media (USB, etc.)
4. Data imported to dashboard on connected system

### Use Cases

✅ **Best For:**
- Classified/top-secret environments (government)
- Air-gapped networks (critical infrastructure)
- Proof-of-concept / demos
- Development and testing
- Paranoid security posture

❌ **Not Ideal For:**
- Real-time monitoring requirements
- Large-scale deployments (manual export doesn't scale)
- Teams expecting automated workflows

### Configuration Example

```yaml
backend:
  type: "local"
  local:
    output_dir: "/var/horns-agent/output"
    format: "json"  # Options: json, csv, parquet

    rotation:
      enabled: true
      max_size: "50MB"
      max_age: "24h"
      max_files: 10

    compression:
      enabled: true
      algorithm: "gzip"

logging:
  outputs:
    - type: "file"
      path: "/var/horns-agent/agent.log"
    - type: "stdout"  # For real-time monitoring
```

### Manual Export Workflow

**Step 1: Collect Data**
```bash
# Agent runs and writes to output directory
horns-agent run --config standalone.yaml

# Data written to:
# /var/horns-agent/output/metrics-2026-01-17.json.gz
# /var/horns-agent/output/security-events-2026-01-17.json.gz
```

**Step 2: Review & Redact (if needed)**
```bash
# Uncompress and review
gunzip /var/horns-agent/output/metrics-2026-01-17.json.gz

# Redact sensitive data (manual or scripted)
sed -i 's/SENSITIVE_VALUE/[REDACTED]/g' metrics-2026-01-17.json
```

**Step 3: Transfer**
```bash
# Copy to removable media
cp /var/horns-agent/output/*.json /mnt/usb/

# Or use offline transfer mechanism (approved by security)
```

**Step 4: Import to Dashboard**
```bash
# On connected system with dashboard access
horns-cli import --file /mnt/usb/metrics-2026-01-17.json
```

---

## Hybrid Deployments

Many enterprise customers use **hybrid deployments**:

### Example 1: Environment-Based
- **Production:** On-premise (compliance requirement)
- **Staging:** SaaS (faster iteration)
- **Development:** Standalone (local testing)

### Example 2: Geographic
- **US Regions:** SaaS (low latency to cloud)
- **EU Regions:** On-premise (GDPR data residency)
- **APAC Regions:** SaaS (faster deployment)

### Example 3: Sensitivity-Based
- **Critical Systems:** Air-gapped standalone
- **Standard Infrastructure:** On-premise gateway
- **Low-sensitivity:** SaaS

---

## Migration Between Modes

Agents can be **re-configured** to change deployment modes:

### SaaS → On-Premise
1. Deploy on-premise gateway
2. Update agent config to point to gateway
3. Restart agent
4. Verify connectivity

**No data loss** - agent buffers during transition

### On-Premise → SaaS
1. Obtain SaaS API key
2. Update agent config
3. Restart agent
4. Decommission gateway (optional)

### Standalone → SaaS/On-Premise
1. Configure network connectivity
2. Update agent config
3. Historical data can be bulk-imported

---

## Decision Framework

### Questions to Ask Prospects

1. **Data Sovereignty:**
   - "Do you have requirements about where data is stored?"
   - "Any regulations requiring on-premise data?"

2. **Infrastructure:**
   - "Do you have existing infrastructure to host services?"
   - "Preference for SaaS vs. self-hosted?"

3. **Team:**
   - "Do you have a dedicated security infrastructure team?"
   - "Comfortable managing additional services?"

4. **Compliance:**
   - "What compliance frameworks do you need to meet?"
   - "Any auditor-specific requirements?"

5. **Scale:**
   - "How many agents do you anticipate deploying?"
   - "Growth plans over next 2-3 years?"

### Recommendation Matrix

| Scenario | Recommended Mode |
|----------|------------------|
| Startup, < 100 agents | SaaS |
| Healthcare, HIPAA required | On-Premise |
| Financial services, PCI-DSS | On-Premise |
| Government, classified data | Standalone or On-Premise |
| Global enterprise, mixed requirements | Hybrid (SaaS + On-Premise) |
| Fast POC needed | SaaS or Standalone |
| Air-gapped critical infrastructure | Standalone |

---

## Pricing Considerations

### SaaS Mode
- **$15-25/agent/month** (volume discounts)
- Includes: Cloud hosting, storage, updates
- No infrastructure costs

### On-Premise Mode
- **$100-200/agent/year** (license)
- Customer provides: Gateway hosting, database, storage
- Support contract: $10K-50K/year (depending on scale)

### Standalone Mode
- **$50-100/agent/year** (license)
- No ongoing infrastructure costs
- Manual export labor cost consideration

---

## Summary for Demo

**Key Talking Points:**

1. **Flexibility:**
   > "Same agent binary, just different configuration. You choose how it deploys based on YOUR requirements."

2. **No Lock-In:**
   > "You can change deployment modes as needs evolve. Start with SaaS, move to on-premise for compliance, or vice versa."

3. **Enterprise-Grade:**
   > "We designed for the reality of enterprise: different teams have different requirements. One platform, multiple deployment options."

4. **Compliance-First:**
   > "For regulated industries, on-premise mode keeps data in your network. You control where data lives, who accesses it, how long you keep it."

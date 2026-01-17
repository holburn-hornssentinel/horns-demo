# Horns Agent - Deployment Configurations

This directory contains example configurations demonstrating the three deployment models for Horns Agent.

## Deployment Models

### 1. SaaS Mode (`saas.yaml`)

**Use Case:** Most customers - SaaS deployment with cloud connectivity

**Architecture:**
```
Agent → Cloud Gateway (TLS) → Horns Sentinel Platform
```

**Benefits:**
- ✅ Zero infrastructure setup
- ✅ Automatic updates
- ✅ Centralized management
- ✅ Global threat intelligence
- ✅ Best for small-medium businesses

**Security:**
- TLS 1.3 encrypted websocket connection
- API key authentication
- Automatic certificate rotation

**Configuration:**
```yaml
backend:
  type: "saas"
  saas:
    endpoint: "wss://agents.hornssentinel.cloud"
    api_key: "${HORNS_AGENT_API_KEY}"
```

---

### 2. On-Premise Mode (`onprem.yaml`)

**Use Case:** Regulated industries with data sovereignty requirements

**Architecture:**
```
Agent → Customer Gateway → Dashboard
(All within customer network)
```

**Benefits:**
- ✅ Data never leaves customer network
- ✅ Full control over data storage
- ✅ Meets compliance requirements (HIPAA, PCI-DSS, SOC2)
- ✅ Ideal for healthcare, finance, government

**Security:**
- Mutual TLS authentication
- Internal network only
- Data masking for sensitive information
- Local buffering during gateway outages

**Configuration:**
```yaml
backend:
  type: "gateway"
  gateway:
    endpoint: "wss://horns-gateway.customer.local:8443"
    auth:
      type: "mutual_tls"
      client_cert: "/path/to/client.crt"
```

---

### 3. Standalone Mode (`standalone.yaml`)

**Use Case:** Air-gapped environments, demos, development/testing

**Architecture:**
```
Agent → Local Files → Manual Export
(No network connectivity)
```

**Benefits:**
- ✅ Complete network isolation
- ✅ Perfect for demos
- ✅ High-security classified environments
- ✅ Development and testing

**Security:**
- No network communication
- All data stays on local machine
- Manual data export process

**Configuration:**
```yaml
backend:
  type: "local"
  local:
    output_dir: "./demo-output"
    format: "json"
```

---

## Demo Usage

### Running in Standalone Mode (for Demo)

```bash
# Start the agent in standalone mode
./scripts/start-agent.sh

# Agent will write data to horns-agent/demo-output/
# View output:
tail -f horns-agent/demo-output/agent.log

# View collected metrics:
cat horns-agent/demo-output/metrics-*.json | jq
```

### Key Demo Talking Points

1. **Same Binary, Different Config**
   - "Horns Agent is a single Go binary. The only difference between deployment modes is configuration."
   - Show config diff between `saas.yaml` and `onprem.yaml`

2. **Flexible Architecture**
   - "We designed for enterprise reality: some customers want SaaS simplicity, others need on-premise control."
   - "You can even mix modes - SaaS for dev/staging, on-premise for production."

3. **Security by Design**
   - "In SaaS mode, we use TLS 1.3 with certificate pinning."
   - "On-premise mode supports mutual TLS and never sends data outside your network."
   - "Standalone mode has zero network communication - perfect for air-gapped environments."

4. **Compliance Ready**
   - "On-premise mode includes built-in data masking for PII."
   - "We support HIPAA, PCI-DSS, SOC2, and other compliance frameworks out of the box."

---

## Configuration Comparison

| Feature | SaaS | On-Premise | Standalone |
|---------|------|------------|------------|
| Network Required | ✅ Yes | ✅ Yes (internal) | ❌ No |
| Data Location | Cloud | Customer network | Local machine |
| Setup Complexity | ⭐ Low | ⭐⭐ Medium | ⭐ Low |
| Updates | Automatic | Manual | Manual |
| Compliance | Standard | Customizable | Full control |
| Cost | Subscription | License + hosting | License |
| Best For | SMB | Enterprise | Demos/Air-gapped |

---

## Technical Details

### System Requirements

- **OS:** Linux (Ubuntu 20.04+, RHEL 8+, Debian 11+)
- **CPU:** 1 core minimum, 2 cores recommended
- **Memory:** 256 MB minimum, 512 MB recommended
- **Disk:** 1 GB for agent + logs
- **Network:** Outbound HTTPS (SaaS/On-Prem modes only)

### Installation

```bash
# Download agent binary
curl -O https://releases.hornssentinel.com/agent/latest/horns-agent-linux-amd64

# Make executable
chmod +x horns-agent-linux-amd64

# Run with configuration
./horns-agent-linux-amd64 run --config /etc/horns-agent/config.yaml
```

### Monitoring

The agent exposes Prometheus metrics on `http://localhost:9090/metrics`:
- `horns_agent_cpu_usage`
- `horns_agent_memory_usage`
- `horns_agent_events_collected`
- `horns_agent_events_transmitted`

---

## Questions for Interview

**Q: How do you handle network interruptions?**
A: "In SaaS and On-Prem modes, the agent buffers data locally during outages. When connectivity resumes, it transmits buffered data automatically. You configure buffer size and retention in the config."

**Q: Can I run some agents in SaaS and others on-premise?**
A: "Absolutely. Many customers do exactly this - dev/staging in SaaS for simplicity, production on-premise for compliance. The dashboard shows all agents regardless of deployment mode."

**Q: What about agent updates?**
A: "SaaS agents auto-update. On-premise and standalone agents update via your standard deployment tools (Ansible, Chef, etc.). We provide version compatibility guarantees - agents can be up to 2 major versions behind the platform."

**Q: How much bandwidth does the agent use?**
A: "Typically 100-500 KB/hour depending on activity. We batch and compress data. You can configure collection intervals and batch sizes to control bandwidth usage."

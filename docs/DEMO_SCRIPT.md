# Horns Sentinel Demo Script

**Interview:** Quilr - Jan 21, 2026 @ 2:00 PM EST
**Duration:** 45-50 minutes (15 min discovery + 30-40 min demo + Q&A)
**Audience:** AI/ML company interested in security solutions

---

## Pre-Demo Checklist

### 15 Minutes Before
- [ ] Start all services: `./scripts/start.sh`
- [ ] Verify all services healthy (check console output)
- [ ] Open tabs:
  - Dashboard: http://localhost:3000
  - HornsIQ: http://localhost:3978
  - API Docs: http://localhost:8000/docs
- [ ] Test HornsIQ with sample query
- [ ] Close unnecessary apps/windows
- [ ] Silence notifications
- [ ] Have backup plan ready (see BACKUP_PLANS.md)

### Environment Check
- [ ] Docker running
- [ ] All 3 services responding
- [ ] Network stable
- [ ] Screen sharing tested
- [ ] Microphone working

---

## Demo Flow

### Phase 1: Discovery (15 minutes)

**Goal:** Understand their needs before diving into product

#### Opening Questions

"Before I show you Horns Sentinel, I'd love to learn about your current security setup and challenges:"

1. **Current State**
   - "What does your security stack look like today?"
   - "How are you currently monitoring for threats?"
   - "What tools are you using?"

2. **Pain Points**
   - "What are your biggest security headaches?"
   - "Have you experienced any security incidents recently?"
   - "What keeps you up at night from a security perspective?"

3. **AI/ML Context**
   - "As an AI/ML company, what unique security concerns do you have?"
   - "Are you handling customer data? What compliance requirements?"
   - "Any specific regulations - SOC2, GDPR, etc.?"

4. **Team & Process**
   - "Who handles security today? Dedicated team or shared responsibility?"
   - "How much time does security monitoring take?"
   - "What's your incident response process?"

#### Active Listening Notes
Take notes on:
- Specific pain points → tie to features
- Compliance needs → emphasize on-premise deployment
- Team size → emphasize automation/AI
- Technology stack → show integration capabilities

**Transition:**
> "Great context, thank you. Based on what you've shared, let me show you how Horns Sentinel addresses [specific pain points]. I'll focus on [relevant areas] that seem most relevant to your needs."

---

### Phase 2: Dashboard Demo (20 minutes)

#### 2.1 Overview Page (5 minutes)

**URL:** http://localhost:3000

**Opening:**
> "This is the Sentinel Dashboard - your security operations command center. What you're seeing is a live demo environment for Acme Corporation, a mid-size tech company similar to yours in scale."

**Key Points:**
- **Security Score (72/100):** "This is a composite score based on vulnerability posture, incident response time, compliance adherence, and more. It gives execs a quick health check."

- **Active Threats:** "Four active threats - these are confirmed security issues requiring immediate attention, not just alerts."

- **Assets:** "847 monitored assets - servers, containers, cloud instances, SaaS applications."

**Walk Through Metrics:**
- Point out alert distribution (2 critical, 4 high, 6 medium, 3 low)
- Explain the trend arrow on Security Score (+5% improvement)
- Show recent alerts feed

**Demo Talking Point:**
> "Notice how everything is real-time. As agents collect data, the dashboard updates automatically. No manual refreshes needed."

#### 2.2 Alerts Page (5 minutes)

**Navigate to:** Alerts tab

**Key Alerts to Highlight:**

1. **ALT-001 - Emotet Malware** (Critical)
   - Click to show detail modal
   - "Detected via behavior analysis - suspicious PowerShell + C2 beaconing"
   - "We didn't wait for signature updates - behavioral detection caught it immediately"

2. **ALT-002 - Unauthorized Admin Access** (Critical)
   - "Geo-anomaly detection - admin login from Russia, but this account should only auth from internal IPs"
   - "This is where AI really shines - understanding normal vs. abnormal behavior"

3. **ALT-003 - CVE-2024-21410 Exploitation** (High)
   - "Attempted exploitation of Exchange vulnerability"
   - "Our WAF blocked most attempts, but this shows attacker interest - prioritize patching"

**Demo Filters:**
- Filter by severity: "Show me only critical alerts"
- Filter by status: "What's still open vs. already mitigated?"
- Search: Type "exchange" to find related alerts

**Talking Points:**
- "Each alert includes affected asset, timeline, and recommended actions"
- "Tags help with threat hunting - 'emotet', 'c2-communication', etc."
- "Status tracking - open, investigating, mitigated, closed"

#### 2.3 Threat Intelligence (5 minutes)

**Navigate to:** Threat Intel tab

**Vulnerabilities Tab:**

Show CVE-2024-21410:
> "This is the Exchange vulnerability we saw attempted exploitation for. Notice the CVSS score, affected systems, and patch status. We automatically correlate CVEs with your actual infrastructure - no wasted time on vulnerabilities that don't affect you."

Key Points:
- Critical vulnerabilities highlighted in red
- Patched vs. unpatched status
- Affected systems list (click to expand)

Filter to "Unpatched" only:
> "These are your immediate priorities - critical vulnerabilities with patches available but not yet applied."

**Threat Intel Tab:**

Show IOC-001 (APT29 Infrastructure):
> "Here's where we track threat indicators - IPs, domains, file hashes. This IP is known APT29 infrastructure. When we saw it in ALT-002 (the unauthorized admin login), that elevated the severity immediately."

**Talking Point for AI/ML Company:**
> "We use machine learning to correlate indicators across multiple sources - your logs, our threat intel, global attack patterns. The AI identifies relationships humans would miss."

#### 2.4 OSINT Findings (5 minutes)

**Navigate to:** OSINT tab

**Critical Finding - OSINT-001:**
Click on "Credential Leak - jsmith@acme.com":
> "This is dark web monitoring in action. We found employee credentials in a stealer log marketplace. The employee had no idea until we flagged it."

**Notice correlation:**
- jsmith@acme.com credential leaked (OSINT-001)
- Same user's laptop infected with Emotet (ALT-001)
- **That's not a coincidence**

> "This is where the platform really shows value - connecting dots across OSINT, endpoint telemetry, and network activity. The AI spotted the pattern."

**Other Findings to Show:**

- **OSINT-002:** AWS keys in GitHub commit history
  > "Developer accidentally committed access keys. We caught it, rotated the keys, and trained the team."

- **OSINT-003:** Dark web forum post seeking VPN access
  > "Someone's actively targeting you. This isn't theoretical - there's marketplace demand for access to your systems."

**Talking Point:**
> "For an AI/ML company handling valuable IP and customer data, OSINT monitoring isn't optional. Your code, your algorithms - that's what attackers want."

---

### Phase 3: HornsIQ Demo (15 minutes)

**URL:** http://localhost:3978

**Introduction:**
> "Now let me show you HornsIQ - our AI security assistant. This is powered by Onyx RAG, and it has access to all your security data, documentation, and industry knowledge."

#### Query 1: Security Posture Summary

**Type:** "Summarize our current security posture"

**Expected Response:**
HornsIQ should provide a coherent summary mentioning:
- Overall security score
- Key threats
- Critical vulnerabilities
- Recommended priorities

**Talking Point:**
> "Instead of hunting through dashboards, you can just ask. Great for executives who want the high-level view."

#### Query 2: Vulnerability Prioritization

**Type:** "What vulnerabilities should we prioritize fixing?"

**Expected Response:**
Should mention CVE-2024-21410, CVE-2024-3400, and others with context

**Talking Point:**
> "HornsIQ understands context - which systems are affected, whether there's active exploitation, business criticality. It's not just listing CVEs, it's advising based on YOUR environment."

#### Query 3: Technical Deep Dive

**Type:** "Explain the Emotet detection on ACME-WS-042"

**Expected Response:**
Should explain the alert, detection methodology, and remediation

**Talking Point:**
> "This is where junior analysts become effective immediately. Instead of reading through alerts and documentation, they get explanations and guidance."

#### Query 4: Compliance Question

**Type:** "What's our PCI-DSS compliance status?"

**Expected Response:**
Should mention compliance violations and requirements

**Talking Point for AI/ML Company:**
> "For AI companies, compliance questions are constant - SOC2, GDPR, data residency. HornsIQ knows your compliance posture and can answer auditor questions instantly."

#### Demo Personas

**Switch persona** to "Security Analyst":
> "Different personas have different knowledge focus. Security Analyst mode emphasizes technical details and threat hunting."

**Try:** "Find indicators of lateral movement"

**Talking Point:**
> "Same platform, different lens. Analysts get technical details, executives get summaries, compliance teams get audit-focused views."

---

### Phase 4: Agent Deployment Models (5 minutes)

**Navigate to:** Dashboard → Agents tab

**Show Agent Fleet:**
> "Let's talk about how data gets into the platform. These are Horns Agents - lightweight Go binaries deployed on your infrastructure."

**Point out different deployment modes:**
- **acme-prod-01, acme-prod-02:** SaaS mode (cloud-connected)
- **acme-db-01:** On-premise mode (customer gateway)
- **acme-backup-01:** Standalone (offline)

**Talking Point:**
> "This is critical for enterprise sales: we support three deployment models based on your security and compliance requirements."

**Show configs** (optional, if time):
```bash
# Quick terminal demo
cat horns-agent/configs/saas.yaml
cat horns-agent/configs/onprem.yaml
```

**Explain deployment options:**

1. **SaaS Mode:** "Most customers - agents connect to our cloud platform"
2. **On-Premise:** "For regulated industries - data never leaves your network"
3. **Standalone:** "Air-gapped environments - completely offline"

**Clickable Insight for AI/ML Company:**
> "As an AI/ML company, you might have different requirements for different environments:
> - Development/staging: SaaS for simplicity
> - Production: On-premise for data control
> - Model training infrastructure: Air-gapped for IP protection"

**Show agent detail:**
Click on acme-prod-01 to show metrics:
- CPU, memory, disk usage
- Network activity
- Last check-in time
- Docker containers monitored

---

### Phase 5: Live Q&A & Potential Build (15-20 minutes)

**Transition:**
> "That's the core platform. Before we wrap up, I'd love to hear your thoughts and answer any questions."

#### Common Questions & Answers

**Q: How does this integrate with our existing tools?**
> "Great question. We integrate via:
> - API (RESTful + webhooks) - show `/docs` endpoint
> - SIEM forwarding (Splunk, Elastic, etc.)
> - Slack/Teams for alerts
> - Ticketing systems (Jira, ServiceNow)
>
> We're tool-agnostic - enhance what you have, don't replace it."

**Q: What about false positives?**
> "Machine learning reduces false positives significantly, but you'll still see some. HornsIQ helps - it can explain WHY something was flagged, so you can quickly assess legitimacy. We also have tuning controls to adjust sensitivity per environment."

**Q: Can you show me how to modify [something]?**
> "Absolutely! Let me open the code..."
> [This is where live coding comes in - have VS Code + Claude Code ready]

**Possible Live Build Scenarios:**
1. "Add a new metric to the dashboard"
2. "Create a custom HornsIQ query"
3. "Build an alert webhook"
4. "Add a new data filter"

**Strategy for Live Build:**
- Keep it scoped (10-15 min max)
- Use Claude Code to speed up implementation
- Explain your thinking as you go
- Show the working result

**Q: What's the pricing model?**
> "We price per agent, with tiers based on features:
> - Basic: Core monitoring, $X/agent/month
> - Professional: + threat intel, compliance, $Y/agent/month
> - Enterprise: + on-premise, custom integrations, call us
>
> Most customers fall in the 50-500 agent range, so around $X-Y/month total. Volume discounts available."

**Q: How long is implementation?**
> "SaaS mode: You can have your first agents reporting in 30 minutes.
> On-premise: 1-2 weeks for gateway setup, then gradual agent rollout.
> We provide implementation support and runbooks."

---

### Closing (5 minutes)

**Summary:**
> "Let me summarize what we've covered:
> 1. **Dashboard**: Real-time security monitoring for your entire infrastructure
> 2. **Threat Intel**: Automated vulnerability tracking and IOC correlation
> 3. **OSINT**: Dark web monitoring for credential leaks and brand protection
> 4. **HornsIQ**: AI assistant that understands YOUR security posture
> 5. **Flexible Deployment**: SaaS, on-premise, or air-gapped - your choice
>
> All of this is powered by AI/ML - behavioral detection, anomaly identification, and intelligent correlation that would take humans hours or days."

**Next Steps:**
> "What I'd suggest for next steps:
> 1. Schedule a technical deep dive with your team (if interested)
> 2. We can run a POC on your actual infrastructure (safe read-only mode)
> 3. I'll send over pricing and implementation timeline
>
> What questions do you still have? What would be most valuable for you to see next?"

**Thank them:**
> "Thanks for your time today. Really enjoyed learning about your setup and challenges. Looking forward to continuing the conversation!"

---

## Timing Guide

| Section | Time | Total |
|---------|------|-------|
| Discovery | 15 min | 0:15 |
| Dashboard Overview | 5 min | 0:20 |
| Alerts | 5 min | 0:25 |
| Threat Intel | 5 min | 0:30 |
| OSINT | 5 min | 0:35 |
| HornsIQ | 15 min | 0:50 |
| Agents | 5 min | 0:55 |
| Q&A / Live Build | 15 min | 1:10 |
| Closing | 5 min | 1:15 |

**Aim for:** 50-60 minutes total (leaving buffer for questions)

---

## Key Messages to Emphasize

### For AI/ML Company (Quilr)

1. **AI-Powered Detection**
   - "We use the same techniques you do - ML models, anomaly detection, pattern recognition"
   - "Behavioral analysis, not just signatures"

2. **Data Intelligence**
   - "Security IS a data problem - we help you make sense of it"
   - "RAG-powered assistant that understands context"

3. **Compliance for AI Companies**
   - "SOC2, GDPR, data residency - we help you meet customer requirements"
   - "On-premise deployment for sensitive model training data"

4. **Developer-Friendly**
   - "API-first architecture"
   - "Integrate with your existing workflows"
   - "Open to customization and extension"

### Universal Value Props

- **Comprehensive:** "Single platform for endpoints, network, cloud, OSINT"
- **Intelligent:** "AI connects the dots humans miss"
- **Flexible:** "Deploy how you need - SaaS, on-prem, or hybrid"
- **Actionable:** "Not just alerts - prioritized recommendations"

---

## Success Metrics

Demo is successful if:
- ✅ They ask technical follow-up questions
- ✅ They share specific pain points from their environment
- ✅ They want to schedule next meeting/POC
- ✅ They ask about pricing/timeline
- ✅ They introduce other stakeholders

Red flags:
- ❌ No questions or engagement
- ❌ "We'll get back to you" with no specifics
- ❌ Concerned about replacing existing tools
- ❌ Sticker shock on pricing

---

## Post-Demo Follow-Up

Within 24 hours:
1. Thank you email
2. Share demo recording (if recorded)
3. Send relevant documentation
4. Propose next steps
5. Connect on LinkedIn

Within 1 week:
1. Technical deep dive (if requested)
2. POC proposal
3. Pricing details
4. Reference customers (if appropriate)

# Horns Sentinel Demo - Quick Reference Card

**Demo Date:** January 21, 2026 @ 2:00 PM EST
**Company:** Quilr (AI/ML Company)
**Duration:** 15 min discovery + 45 min demo

---

## 🚀 Access URLs (KEEP THESE OPEN)

```
Dashboard:  http://localhost:3002
API Docs:   http://localhost:8001/docs
HornsIQ:    http://localhost:3978
```

---

## 🎬 Demo Flow (40 minutes)

### 1. Opening Hook (30 seconds)

> "Most security tools just show you alerts. Horns Sentinel takes action. Let me show you..."

### 2. Alerts + AI Recommendations (5 minutes)

**Navigate to:** http://localhost:3002/alerts

**Steps:**
1. Point out 2 critical alerts
2. Click "Emotet Variant Detected" (ALT-001)
3. **Highlight AI Badge:** "95% confidence - Isolate endpoint immediately"
4. Click "Resolve" button
5. **Show toast notification**
6. **Point out instant update** (no page reload)

**Talking Point:**
> "Our AI analyzes every threat and provides confidence-based recommendations. For high-confidence threats like this 95%, you can enable automatic response. For medium confidence, keep human-in-the-loop."

### 3. Threat Intel + Distributed Response (5 minutes)

**Navigate to:** http://localhost:3002/threats → Threat Intel tab

**Steps:**
1. Click "Block" on any threat IOC
2. **Show toast:** "IOC added to blocklist. Agents will receive update in ~60 seconds."

**Talking Point:**
> "That just pushed this block to every Horns Agent on the network. Distributed response in under a minute. No manual firewall rules, no ticket queue."

### 4. OSINT + Export (3 minutes)

**Navigate to:** http://localhost:3002/osint → Findings tab

**Steps:**
1. Show credential leak findings
2. Click "Export PDF"
3. **Show toast:** "Exporting 14 findings as PDF..."

**Talking Point:**
> "One-click reporting. Ready to share with stakeholders or compliance teams."

### 5. HornsIQ (If time permits - 5 minutes)

**Navigate to:** http://localhost:3978

**Sample Queries:**
- "What are our critical vulnerabilities?"
- "Summarize our security posture"
- "What should we prioritize?"

---

## 🎯 Key Value Props for Quilr

### 1. Agentic Security Platform
- Not passive monitoring - active response
- AI recommends, system executes
- Human-in-the-loop where needed

### 2. Real AI/ML Integration
- Confidence scoring on threats
- Pattern detection across sources
- Learns from response history

### 3. Intelligence-Driven
- Correlates threats automatically
- Prioritizes by business impact
- Actionable recommendations, not just data

---

## 💬 Key Talking Points

### "Detection Without Response Is Just Expensive Logging"
Use when showing action buttons

### "Agentic Architecture"
Use when showing distributed agent response

### "Confidence-Based Automation"
Use when showing AI recommendations

### "One-Click Remediation"
Use when showing any action button

---

## 🔥 Demo Wow Moments

1. **AI Badge showing 95% confidence** - "This is real AI, not marketing AI"
2. **Instant toast feedback** - "Modern UX, no waiting"
3. **Distributed agent message** - "Enterprise-scale response"
4. **Export in one click** - "Compliance-ready"

---

## ❓ Anticipated Questions & Answers

**Q: "How accurate is your AI?"**
> "Our AI is trained on millions of threat samples. We show confidence scores so you can tune automation thresholds. High confidence (90%+) for auto-response, medium for review."

**Q: "Can this integrate with our existing tools?"**
> "Absolutely. API-first architecture. We have pre-built integrations with Slack, Teams, JIRA, and webhooks for custom workflows."

**Q: "What about false positives?"**
> "That's why we show confidence scores. You set the threshold - we recommend 90% for auto-response. Everything else gets human review. You stay in control."

**Q: "How does this compare to [competitor]?"**
> "Most SIEMs just alert. We provide AI-recommended actions and distributed response. Think of it as moving from reactive to proactive security."

**Q: "Can we try this on our infrastructure?"**
> "Yes! We can do a 2-week POC. Single agent deployment, connects to your existing data sources. No rip-and-replace."

---

## 🚨 Backup Plans

### If Dashboard Fails
- Use screenshots in `/home/horns/demo-screenshots/`
- Show API docs at http://localhost:8001/docs
- Walk through code architecture

### If HornsIQ Fails
- Check Onyx: `curl http://welcometocostco:8080/health`
- Use cached responses
- Show Teams integration instead

### If Everything Fails
- "Let me show you our architecture instead..."
- Use the demo as a product feedback session
- Reschedule with compensation (extra demo time)

---

## ✅ Pre-Demo Checklist (1 hour before)

- [ ] Start services: `cd /home/horns/horns-demo && docker compose up -d`
- [ ] Verify dashboard: http://localhost:3002
- [ ] Test one action button (to warm up containers)
- [ ] Close all unnecessary tabs
- [ ] Silence notifications
- [ ] Test screen sharing
- [ ] Water bottle ready
- [ ] Deep breath 😊

---

## 📊 Success Metrics

Demo is successful if:
- ✅ Prospect asks about auto-response capabilities
- ✅ Prospect asks about AI training/customization
- ✅ Prospect compares to their current tools
- ✅ Prospect asks about pricing/timeline
- ✅ Prospect wants to schedule POC
- ✅ Prospect introduces other stakeholders

---

## 🎯 Closing Ask

> "Based on what you've seen, I'd love to set up a 2-week POC on your infrastructure. We'll deploy a single agent, connect to your existing data sources, and you can see this in action on your own threats. Does that sound valuable?"

**Scheduling:** Offer 2-3 specific time slots

---

**Remember:** You've built something impressive. Trust your preparation. Be yourself. You've got this! 🚀

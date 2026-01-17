# Demo Backup Plans

**Murphy's Law for Demos:** *"Anything that can go wrong, will go wrong - right when you're sharing your screen."*

This document outlines contingency plans for every foreseeable failure mode during the Horns Sentinel demo.

---

## Pre-Demo Preparation

### Critical Backups
- [ ] Screenshots of all key dashboard views (in `/home/horns/demo-screenshots/`)
- [ ] Video recording of full demo walkthrough
- [ ] PDF export of demo data (alerts, CVEs, OSINT findings)
- [ ] Backup laptop/device ready to go
- [ ] Mobile hotspot available (network backup)

### Test Checklist (Run 30 min before demo)
```bash
# Full system check
./scripts/start.sh

# Verify each service
curl http://localhost:8000/health
curl http://localhost:3000
curl http://localhost:3978/health

# Test HornsIQ
curl -X POST http://localhost:3978/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are our critical vulnerabilities?"}'

# Check Onyx connectivity (if using)
curl http://welcometocostco:8080/health
```

---

## Failure Scenarios & Responses

### Scenario 1: Dashboard Won't Start

**Symptoms:**
- `http://localhost:3000` not responding
- Next.js build errors
- Port 3000 already in use

**Immediate Actions:**

**Option A: Restart Dashboard**
```bash
# Stop and restart
docker-compose restart dashboard

# Check logs
docker-compose logs -f dashboard
```

**Option B: Use Production Dashboard**
```bash
# If you have a production Sentinel instance running
# Navigate to existing instance instead

# Talking point:
> "Let me show you our production instance instead - it has real production data rather than demo data, which is even better."
```

**Option C: Use Screenshots**
```bash
# Navigate to screenshots directory
cd /home/horns/demo-screenshots/

# Share screen of image viewer
# Walk through static screenshots

# Talking point:
> "I'm experiencing a technical issue with the live demo, but let me walk you through these screenshots of the platform. I'll send you a video recording of the full demo after this call."
```

**Option D: Fallback to API Docs**
```bash
# Show API at http://localhost:8000/docs

# Talking point:
> "While the dashboard is having issues, let me show you the API directly - this is what powers everything. It demonstrates the data model and capabilities."
```

---

### Scenario 2: HornsIQ Can't Connect to Onyx

**Symptoms:**
- HornsIQ returns "Unable to connect" errors
- Onyx service unreachable
- Network timeout

**Immediate Actions:**

**Option A: Quick Onyx Check**
```bash
# Verify Onyx is running on welcometocostco
ssh welcometocostco 'docker ps | grep onyx'

# If down, restart (if you have access)
ssh welcometocostco 'cd ~/onyx && docker-compose up -d'

# Talking point:
> "Give me just a moment while I reconnect to the knowledge base..."
```

**Option B: Use Cached Responses**
```javascript
// If HornsIQ chat interface has cached responses feature
// Show previous successful queries

// Talking point:
> "I'm having connectivity issues with the live AI, but let me show you some example queries and responses we prepared earlier."
```

**Option C: Switch to Teams HornsIQ**
```bash
# If you have HornsIQ running in Teams
# Switch to Teams demo

# Talking point:
> "Actually, let me show you HornsIQ in Microsoft Teams instead - many customers prefer the Teams integration anyway."
```

**Option D: Describe Without Showing**
```
# Use screenshots + narrative

# Talking point:
> "I'm experiencing connectivity issues with the live AI demo, but let me describe how HornsIQ works and show you some example interactions. The key capability is..."

# Show screenshots of past successful queries
```

---

### Scenario 3: API Server Fails

**Symptoms:**
- Dashboard shows "Failed to fetch data"
- API not responding on port 8000
- Database connection errors

**Immediate Actions:**

**Option A: Restart API**
```bash
docker-compose restart api
docker-compose logs -f api
```

**Option B: Check Data Files**
```bash
# Verify demo data exists
ls -lh api-server/data/

# If missing, regenerate
cp api-server/data.backup/* api-server/data/
```

**Option C: Use Static Data**
```bash
# Serve static JSON files directly
cd api-server/data
python3 -m http.server 8001

# Point browser to:
# http://localhost:8001/alerts.json
# http://localhost:8001/vulnerabilities.json

# Talking point:
> "Let me show you the raw data directly - this is what the API serves up."
```

---

### Scenario 4: Complete Docker Failure

**Symptoms:**
- Docker daemon not responding
- All containers down
- Can't start any services

**Immediate Actions:**

**Option A: Restart Docker**
```bash
sudo systemctl restart docker
# Wait 30 seconds
./scripts/start.sh
```

**Option B: Use Backup Environment**
```bash
# If you have a backup VM or server with demo pre-running
ssh backup-server
# Access services via SSH tunnel or VPN

# Talking point:
> "I'm switching to our backup environment - this actually demonstrates our multi-region deployment capability."
```

**Option C: Screenshots + Video**
```bash
# Use pre-recorded video demo
vlc ~/demo-recordings/horns-sentinel-full-demo.mp4

# OR use screenshots with live narration

# Talking point:
> "I'm experiencing technical difficulties, but I have a full video walkthrough I can show you. Better yet, I'll send you a link so you can review at your own pace."
```

---

### Scenario 5: Network Connectivity Issues

**Symptoms:**
- Can't access external resources
- Screen sharing freezing
- Audio cutting out

**Immediate Actions:**

**Option A: Switch Networks**
```bash
# Switch to mobile hotspot
# Reconnect to call

# Talking point:
> "Switching networks - just a moment."
```

**Option B: Move to Audio-Only**
```
# Stop screen sharing
# Describe demo verbally
# Send screenshots via chat

# Talking point:
> "I'm going to stop screen sharing to improve connection quality. I'll walk you through the demo verbally and share screenshots in the chat."
```

**Option C: Reschedule**
```
# If connection is completely unusable

# Talking point:
> "I apologize - I'm having significant connectivity issues. Rather than have a poor experience, can we reschedule for [specific time]? I'll send you a demo video to review in the meantime."
```

---

### Scenario 6: Demo Data Not Showing Properly

**Symptoms:**
- Empty dashboard
- No alerts/vulnerabilities showing
- API returning empty arrays

**Immediate Actions:**

**Option A: Verify Data Files**
```bash
# Check data exists
cat api-server/data/alerts.json | jq length
cat api-server/data/vulnerabilities.json | jq length

# If empty, restore from backup
cp -r api-server/data.backup/* api-server/data/
docker-compose restart api
```

**Option B: Use API Docs to Show Data Structure**
```bash
# Open http://localhost:8000/docs
# Use "Try it out" to show API responses

# Talking point:
> "Let me show you the data structure directly via the API - this actually gives you better insight into how it works programmatically."
```

**Option C: Show Code Instead**
```bash
# Open data files in VS Code
code api-server/data/alerts.json

# Talking point:
> "Let me show you the underlying data model - this is what the dashboard visualizes."
```

---

### Scenario 7: Screen Sharing Issues

**Symptoms:**
- Can't share screen
- Attendees can't see your screen
- Zoom/Teams freezing when sharing

**Immediate Actions:**

**Option A: Restart Sharing**
```
# Stop and restart screen share
# Try sharing specific window instead of full screen
```

**Option B: Switch Meeting Platform**
```
# If using Zoom, switch to Google Meet (or vice versa)
# Send new meeting link

# Talking point:
> "Let me send you a new meeting link - we'll switch platforms to resolve the screen sharing issue."
```

**Option C: Remote Desktop**
```
# Invite attendee to view via TeamViewer/AnyDesk
# Or SSH + tmux sharing for technical audience

# Talking point:
> "For a better experience, I'm going to give you direct access to view the demo environment. Check chat for the link."
```

---

### Scenario 8: Forgot to Start Services

**Symptoms:**
- Nothing works
- Realize services aren't running mid-demo

**Immediate Actions:**

```bash
# Quick start (background process)
./scripts/start.sh

# Talk while services start (~2 minutes)
# Use this time for discovery questions!

# Talking point:
> "While the environment spins up, let me ask you a few questions about your current security setup..."

# Fill 2-3 minutes with questions:
# - Current security tools
# - Team structure
# - Biggest pain points
# - Compliance requirements
```

---

### Scenario 9: HornsIQ Gives Poor/Wrong Answers

**Symptoms:**
- Onyx returns irrelevant responses
- AI hallucinates information
- Queries timeout or error

**Immediate Actions:**

**Option A: Acknowledge and Pivot**
```
# Talking point:
> "That's not quite the response I expected - let me try a different query. In production, we would fine-tune the knowledge base to improve responses like this."
```

**Option B: Show Alternative Features**
```
# Skip HornsIQ, focus on other features
# Dashboard, threat intel, OSINT

# Talking point:
> "Let me show you some other capabilities while we're having AI connectivity issues..."
```

**Option C: Use Pre-Vetted Queries**
```
# Have list of known-good queries ready
# Use suggestion chips

# Known good queries:
1. "Summarize our security posture"
2. "What vulnerabilities should we prioritize?"
3. "Explain the Emotet detection"
```

---

### Scenario 10: Interviewer Asks for Live Coding

**Symptoms:**
- "Can you add a feature on the fly?"
- "Can you show me the code?"
- "How would you implement X?"

**Immediate Actions:**

**Option A: Simple Change (5-10 min)**
```bash
# Open VS Code
code /home/horns/horns-demo

# Suggest a scoped change:
> "Great question! Let me show you how we'd add a new dashboard widget. I'll use Claude Code to help write it quickly."

# Example quick wins:
# - Add new metric card
# - Add filter to alert page
# - Create new API endpoint
# - Customize color theme
```

**Option B: Explain Architecture Instead**
```bash
# Show codebase structure
tree -L 2 /home/horns/horns-demo

# Talking point:
> "Let me walk you through the architecture instead of live coding - that'll give you better understanding of how it's structured."
```

**Option C: Defer to Follow-Up**
```
# Talking point:
> "That's a great feature idea! Given our time constraints, would it make sense to add that to a follow-up technical session? I'd want to give it proper attention rather than rush it."
```

---

## Emergency Contacts & Resources

### Quick References
- **Onyx Server:** welcometocostco (192.168.1.100)
- **Backup Demo:** [URL if you have one]
- **Demo Video:** `/home/horns/demo-recordings/`
- **Screenshots:** `/home/horns/demo-screenshots/`

### Support (if applicable)
- **Horns Team Lead:** [Name/Contact]
- **DevOps On-Call:** [Contact]
- **Backup Presenter:** [Name/Contact]

---

## Mental Preparation

### Mindset for Failures

**Remember:**
1. Technical issues happen to everyone
2. How you handle failures shows professionalism
3. Prospects understand - they've had demos fail too
4. A good narrative can salvage a broken demo
5. Acknowledging issues honestly builds trust

### Recovery Scripts

**Minor Issue:**
> "Give me just a moment while I fix this... [quick fix attempt]... Great, back on track. Where were we?"

**Major Issue:**
> "I'm experiencing technical difficulties. Rather than waste your time, let me [fallback option]. I'll also send you a full video walkthrough after this call."

**Complete Failure:**
> "I sincerely apologize - I'm having major technical issues today. I'd love to reschedule so I can give you the full experience. When would work for you? In the meantime, I'll send you a video demo and documentation."

### Never Say:
- ❌ "This has never happened before"
- ❌ "It worked perfectly yesterday"
- ❌ "I don't know why this isn't working"
- ❌ "This is so embarrassing"

### Always Say:
- ✅ "Let me try an alternative approach"
- ✅ "I have a backup plan for this"
- ✅ "Great opportunity to show you [alternative feature]"
- ✅ "I'll make sure you get the full experience - here's what I'll do..."

---

## Post-Failure Follow-Up

### Immediate (Same Day):
1. Send apology email
2. Include demo video recording
3. Offer reschedule or follow-up
4. Provide additional resources (docs, trial account, etc.)

### Template Email:
```
Subject: Apologies for Today's Demo + Full Recording

Hi [Name],

I apologize for the technical difficulties during our demo today. These things happen, but I wanted to make sure you get the full Horns Sentinel experience.

I've attached:
- Full video walkthrough (20 minutes)
- Platform documentation
- Architecture overview
- Pricing sheet

I'd also love to reschedule for a live demo when my demo environment is behaving. Would [specific dates/times] work?

Alternatively, I can set up a free trial account for you to explore on your own.

Thanks for your patience today!

Best,
[Your Name]
```

---

## Practice Makes Perfect

### Pre-Demo Rehearsal Checklist
- [ ] Run through demo end-to-end
- [ ] Intentionally break something and practice recovery
- [ ] Time each section
- [ ] Practice talking points out loud
- [ ] Have someone watch and give feedback
- [ ] Test on same network/setup you'll use for real demo
- [ ] Prepare all backup materials (screenshots, video, etc.)

### Failure Drills

Practice these scenarios:
1. **Dashboard won't load** - How fast can you pivot to screenshots?
2. **HornsIQ offline** - Can you still deliver value?
3. **Complete service failure** - Can you narrate from screenshots effectively?
4. **Screen sharing breaks** - How do you recover?
5. **Forgot to prepare** - Can you improvise?

**Run at least one failure drill before the real demo!**

---

## Summary: Hierarchy of Fallbacks

### Tier 1: Quick Fixes (< 30 seconds)
- Restart service
- Refresh page
- Check connectivity
- Try alternative query

### Tier 2: Workarounds (30 seconds - 2 minutes)
- Switch to backup service
- Use alternative feature
- Show via API instead of UI
- Navigate to different section

### Tier 3: Alternative Delivery (2-5 minutes)
- Use screenshots
- Show video recording
- Walk through code/data
- Describe + follow-up

### Tier 4: Abort & Reschedule
- Acknowledge failure professionally
- Offer immediate reschedule
- Send resources promptly
- Turn into relationship-building opportunity

---

## Final Thought

> "The demo is not the product. The demo is a conversation about how the product solves the prospect's problems. Even a failed demo can be successful if you learn about their needs and build trust."

**Good luck! You've got this.** 🚀

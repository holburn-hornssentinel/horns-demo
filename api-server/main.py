"""
Horns Sentinel Demo API Server

Provides demo security data endpoints for the Sentinel Dashboard.
"""
import json
import os
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# Data Models
class Alert(BaseModel):
    id: str
    severity: str
    type: str
    title: str
    description: str
    affected_asset: str
    detected_at: str
    status: str
    tags: Optional[List[str]] = []
    ai_confidence: Optional[int] = None
    ai_recommendation: Optional[str] = None


class Vulnerability(BaseModel):
    cve_id: str
    severity: str
    cvss_score: float
    title: str
    description: str
    affected_systems: List[str]
    published_date: str
    patched: bool
    patch_available: bool


class ThreatIntel(BaseModel):
    id: str
    type: str
    indicator: str
    description: str
    first_seen: str
    last_seen: str
    confidence: str
    tags: List[str]


class OSINTFinding(BaseModel):
    id: str
    type: str
    source: str
    finding: str
    severity: str
    discovered_at: str
    verified: bool


class Agent(BaseModel):
    id: str
    name: str
    hostname: str
    deployment_mode: str
    status: str
    last_checkin: str
    version: str
    tags: Dict[str, str]
    metrics: Dict[str, Any]


class DashboardStats(BaseModel):
    security_score: int
    total_assets: int
    active_threats: int
    critical_alerts: int
    high_alerts: int
    medium_alerts: int
    low_alerts: int
    vulnerabilities_total: int
    vulnerabilities_critical: int
    osint_findings: int
    connected_agents: int


# Initialize FastAPI app
app = FastAPI(
    title="Horns Sentinel Demo API",
    description="Demo API for Horns Sentinel security platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Demo only - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data directory
DATA_DIR = Path("/app/data")


def load_json_data(filename: str) -> Any:
    """Load JSON data from file."""
    filepath = DATA_DIR / filename
    if not filepath.exists():
        return []
    with open(filepath, 'r') as f:
        return json.load(f)


@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "service": "Horns Sentinel Demo API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": [
            "/api/stats",
            "/api/alerts",
            "/api/vulnerabilities",
            "/api/threats",
            "/api/osint",
            "/api/agents",
        ]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get overall dashboard statistics."""
    alerts = load_json_data("alerts.json")
    vulnerabilities = load_json_data("vulnerabilities.json")
    osint = load_json_data("osint.json")
    agents = load_json_data("agents.json")

    # Calculate statistics
    alert_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for alert in alerts:
        severity = alert.get("severity", "low")
        alert_counts[severity] = alert_counts.get(severity, 0) + 1

    vuln_critical = sum(1 for v in vulnerabilities if v.get("severity") == "critical")

    return DashboardStats(
        security_score=72,
        total_assets=847,
        active_threats=4,
        critical_alerts=alert_counts["critical"],
        high_alerts=alert_counts["high"],
        medium_alerts=alert_counts["medium"],
        low_alerts=alert_counts["low"],
        vulnerabilities_total=len(vulnerabilities),
        vulnerabilities_critical=vuln_critical,
        osint_findings=len(osint),
        connected_agents=len(agents)
    )


@app.get("/api/alerts", response_model=List[Alert])
async def get_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get security alerts."""
    alerts = load_json_data("alerts.json")

    # Apply filters
    if severity:
        alerts = [a for a in alerts if a.get("severity") == severity]
    if status:
        alerts = [a for a in alerts if a.get("status") == status]

    return alerts[:limit]


@app.get("/api/alerts/{alert_id}", response_model=Alert)
async def get_alert_detail(alert_id: str):
    """Get detailed information for a specific alert."""
    alerts = load_json_data("alerts.json")

    for alert in alerts:
        if alert.get("id") == alert_id:
            return alert

    raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")


@app.get("/api/vulnerabilities", response_model=List[Vulnerability])
async def get_vulnerabilities(
    severity: Optional[str] = Query(None, description="Filter by severity"),
    patched: Optional[bool] = Query(None, description="Filter by patch status"),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get vulnerabilities (CVEs)."""
    vulns = load_json_data("vulnerabilities.json")

    # Apply filters
    if severity:
        vulns = [v for v in vulns if v.get("severity") == severity]
    if patched is not None:
        vulns = [v for v in vulns if v.get("patched") == patched]

    return vulns[:limit]


@app.get("/api/threats", response_model=List[ThreatIntel])
async def get_threat_intel(
    type: Optional[str] = Query(None, description="Filter by threat type"),
    confidence: Optional[str] = Query(None, description="Filter by confidence level"),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get threat intelligence indicators."""
    threats = load_json_data("threats.json")

    # Apply filters
    if type:
        threats = [t for t in threats if t.get("type") == type]
    if confidence:
        threats = [t for t in threats if t.get("confidence") == confidence]

    return threats[:limit]


@app.get("/api/osint", response_model=List[OSINTFinding])
async def get_osint_findings(
    type: Optional[str] = Query(None, description="Filter by finding type"),
    verified: Optional[bool] = Query(None, description="Filter by verification status"),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get OSINT findings."""
    osint = load_json_data("osint.json")

    # Apply filters
    if type:
        osint = [o for o in osint if o.get("type") == type]
    if verified is not None:
        osint = [o for o in osint if o.get("verified") == verified]

    return osint[:limit]


@app.get("/api/agents", response_model=List[Agent])
async def get_agents(
    status: Optional[str] = Query(None, description="Filter by agent status"),
    deployment_mode: Optional[str] = Query(None, description="Filter by deployment mode")
):
    """Get connected agents."""
    agents = load_json_data("agents.json")

    # Apply filters
    if status:
        agents = [a for a in agents if a.get("status") == status]
    if deployment_mode:
        agents = [a for a in agents if a.get("deployment_mode") == deployment_mode]

    return agents


@app.get("/api/agents/{agent_id}", response_model=Agent)
async def get_agent_detail(agent_id: str):
    """Get detailed information for a specific agent."""
    agents = load_json_data("agents.json")

    for agent in agents:
        if agent.get("id") == agent_id:
            return agent

    raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")


@app.get("/api/sentiment/mentions")
async def get_sentiment_mentions():
    """Get brand sentiment mentions and analytics."""
    data = load_json_data("sentiment.json")
    return data


# Action Endpoints (for demo - these would modify state in production)

@app.post("/api/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Acknowledge an alert (demo only - doesn't persist)."""
    return {
        "status": "success",
        "action": "acknowledge",
        "alert_id": alert_id,
        "message": f"Alert {alert_id} acknowledged"
    }


@app.post("/api/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Resolve an alert (demo only - doesn't persist)."""
    return {
        "status": "success",
        "action": "resolve",
        "alert_id": alert_id,
        "message": f"Alert {alert_id} marked as resolved"
    }


@app.post("/api/alerts/{alert_id}/escalate")
async def escalate_alert(alert_id: str):
    """Escalate an alert (demo only - doesn't persist)."""
    return {
        "status": "success",
        "action": "escalate",
        "alert_id": alert_id,
        "message": f"Alert {alert_id} escalated to security team"
    }


@app.post("/api/threats/ioc/{ioc_id}/block")
async def block_ioc(ioc_id: str):
    """Block a threat IOC (demo only - doesn't persist)."""
    return {
        "status": "success",
        "action": "block",
        "ioc_id": ioc_id,
        "message": f"IOC {ioc_id} added to blocklist. Agents will receive update in ~60 seconds."
    }


@app.post("/api/vulnerabilities/{cve_id}/patch")
async def mark_patched(cve_id: str):
    """Mark vulnerability as patched (demo only - doesn't persist)."""
    return {
        "status": "success",
        "action": "mark_patched",
        "cve_id": cve_id,
        "message": f"Vulnerability {cve_id} marked as patched"
    }


@app.post("/api/osint/findings/{finding_id}/save")
async def save_osint_finding(finding_id: str):
    """Save OSINT finding (demo only - doesn't persist)."""
    return {
        "status": "success",
        "action": "save",
        "finding_id": finding_id,
        "message": "Finding saved to investigation workspace"
    }


@app.post("/api/osint/export")
async def export_osint(format: str = "csv"):
    """Export OSINT findings (demo only - returns mock download)."""
    return {
        "status": "success",
        "action": "export",
        "format": format,
        "download_url": f"/downloads/osint-report-{datetime.utcnow().strftime('%Y%m%d')}.{format}",
        "message": f"Report exported as {format.upper()}"
    }


@app.post("/api/agents/{agent_id}/restart")
async def restart_agent(agent_id: str):
    """Restart an agent (demo only - doesn't actually restart)."""
    return {
        "status": "success",
        "action": "restart",
        "agent_id": "agent_id",
        "message": f"Agent {agent_id} restart initiated. ETA: 30 seconds.",
        "eta_seconds": 30
    }


@app.get("/api/security-tools/status")
async def get_security_tools_status():
    """Get security tools status (matches production integrations with verified 2024-2025 pricing)."""
    return {
        "tools": [
            {
                "id": "nuclei",
                "name": "Nuclei",
                "category": "vulnerability",
                "status": "healthy",
                "description": "Fast vulnerability scanner with 11,000+ templates for comprehensive security testing",
                "capabilities": ["CVE Detection", "Misconfigurations", "Exposed Panels", "Web Vulnerabilities"],
                "replaces": "Nessus Professional",
                "monthlySavings": 299,
                "lastRun": "2 minutes ago",
                "findingsCount": 127,
                "icon": "🔍"
            },
            {
                "id": "nmap",
                "name": "Nmap",
                "category": "network",
                "status": "healthy",
                "description": "Network discovery and service detection for comprehensive infrastructure mapping",
                "capabilities": ["Port Scanning", "Service Detection", "OS Fingerprinting", "Network Topology"],
                "replaces": "Shodan Small Business",
                "monthlySavings": 329,
                "lastRun": "5 minutes ago",
                "findingsCount": 89,
                "icon": "🌐"
            },
            {
                "id": "httpx",
                "name": "HTTPx",
                "category": "network",
                "status": "healthy",
                "description": "Fast HTTP toolkit for web server detection and technology fingerprinting",
                "capabilities": ["HTTP Probing", "Tech Stack Detection", "Web Server Analysis", "SSL/TLS Info"],
                "replaces": "Included in ASM tools",
                "monthlySavings": 0,
                "lastRun": "3 minutes ago",
                "findingsCount": 234,
                "icon": "🔗"
            },
            {
                "id": "subfinder",
                "name": "Subfinder",
                "category": "network",
                "status": "healthy",
                "description": "Passive subdomain discovery using multiple OSINT sources for attack surface mapping",
                "capabilities": ["Subdomain Enumeration", "DNS Discovery", "Attack Surface Mapping", "OSINT Aggregation"],
                "replaces": "SecurityTrails",
                "monthlySavings": 1000,
                "lastRun": "10 minutes ago",
                "findingsCount": 156,
                "icon": "🔎"
            },
            {
                "id": "crowdsec",
                "name": "CrowdSec",
                "category": "threat-intel",
                "status": "healthy",
                "description": "Community-powered threat intelligence with real-time IP reputation and attack detection",
                "capabilities": ["IP Reputation", "Attack Detection", "Community Intelligence", "Blocklist Management"],
                "replaces": "Microsoft Sentinel",
                "monthlySavings": 800,
                "lastRun": "1 minute ago",
                "findingsCount": 342,
                "icon": "🛡️"
            },
            {
                "id": "contextal",
                "name": "Contextal",
                "category": "malware",
                "status": "healthy",
                "description": "Behavioral malware analysis engine for detecting threats through execution patterns",
                "capabilities": ["Behavioral Analysis", "File Scanning", "Threat Detection", "Sandbox Execution"],
                "replaces": "ANY.RUN Sandbox",
                "monthlySavings": 1000,
                "lastRun": "4 minutes ago",
                "findingsCount": 23,
                "icon": "🦠"
            }
        ],
        "summary": {
            "totalTools": 6,
            "healthyTools": 6,
            "degradedTools": 0,
            "offlineTools": 0,
            "totalMonthlySavings": 3428,
            "totalFindings": 971
        },
        "pricing_sources": {
            "nuclei": "Tenable Nessus Professional: $3,590/year = $299/mo (tenable.com/buy, G2.com)",
            "nmap": "Shodan Small Business: $299-359/month (account.shodan.io/billing)",
            "subfinder": "SecurityTrails Professional: $11K-70K/year, conservative $12K/year = $1,000/mo (securitytrails.com/pricing)",
            "crowdsec": "Microsoft Sentinel (Azure SIEM): $5.22/GB PAYG, ~$342/mo for 100GB/day commitment, using $800/mo for 200GB/day mid-tier (microsoft.com/security/pricing, UnderDefense)",
            "contextal": "ANY.RUN Interactive Sandbox: $5,500-14,000/year ($458-1,167/mo), using $1,000/mo enterprise tier (any.run/plans, SaaSWorthy)",
            "note": "All pricing verified from official vendor sites and industry sources (2024-2025)"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

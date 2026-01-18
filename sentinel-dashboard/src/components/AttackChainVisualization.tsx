/**
 * Attack Chain Correlation Visualization
 *
 * Shows how multiple security findings are correlated into attack chains
 * Demonstrates AI-powered threat correlation across tools
 */

import { useState } from 'react'
import { AlertTriangle, Shield, Eye, Activity, TrendingUp, Zap } from 'lucide-react'

interface AttackStep {
  id: string
  phase: string
  finding: string
  source: string[]
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp: string
  description: string
}

interface AttackChain {
  id: string
  name: string
  riskScore: number
  confidence: number
  steps: AttackStep[]
  aiInsight: string
  recommendations: string[]
  targetAsset: string
}

interface AttackChainVisualizationProps {
  chains?: AttackChain[]
}

export default function AttackChainVisualization({ chains = demoChains }: AttackChainVisualizationProps) {
  const [selectedChain, setSelectedChain] = useState<AttackChain | null>(chains[0] || null)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'reconnaissance': return Eye
      case 'initial access': return AlertTriangle
      case 'execution': return Zap
      case 'persistence': return Activity
      case 'privilege escalation': return TrendingUp
      default: return Shield
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Attack Chain Analysis</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered correlation of security findings into attack scenarios
          </p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-horns-blue/10 border border-horns-blue/30 rounded-lg">
          <Activity className="w-5 h-5 text-horns-blue" />
          <span className="text-sm font-semibold text-horns-blue">
            {chains.length} Active Chain{chains.length !== 1 ? 's' : ''} Detected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chain List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase">Detected Chains</h3>
          {chains.map((chain) => (
            <div
              key={chain.id}
              onClick={() => setSelectedChain(chain)}
              className={`bg-card rounded-lg p-4 border cursor-pointer transition-all ${
                selectedChain?.id === chain.id
                  ? 'border-horns-blue shadow-lg'
                  : 'border-border hover:border-horns-blue/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-card-foreground text-sm">{chain.name}</h4>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    chain.riskScore >= 80 ? 'bg-red-500' :
                    chain.riskScore >= 60 ? 'bg-orange-500' :
                    chain.riskScore >= 40 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className={`font-bold ${
                    chain.riskScore >= 80 ? 'text-red-400' :
                    chain.riskScore >= 60 ? 'text-orange-400' :
                    chain.riskScore >= 40 ? 'text-yellow-400' : 'text-blue-400'
                  }`}>{chain.riskScore}/100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">AI Confidence</span>
                  <span className="font-semibold text-horns-blue">{chain.confidence}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Steps</span>
                  <span className="font-semibold text-card-foreground">{chain.steps.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chain Visualization */}
        {selectedChain && (
          <div className="lg:col-span-2 space-y-4">
            {/* Chain Header */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-xl font-bold text-card-foreground mb-2">{selectedChain.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">Target: <span className="font-mono text-card-foreground">{selectedChain.targetAsset}</span></p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          selectedChain.riskScore >= 80 ? 'bg-red-500' :
                          selectedChain.riskScore >= 60 ? 'bg-orange-500' :
                          selectedChain.riskScore >= 40 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${selectedChain.riskScore}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-card-foreground">{selectedChain.riskScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">AI Confidence</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div className="bg-horns-blue h-2 rounded-full" style={{ width: `${selectedChain.confidence}%` }}></div>
                    </div>
                    <span className="text-lg font-bold text-horns-blue">{selectedChain.confidence}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Attack Steps</p>
                  <p className="text-lg font-bold text-card-foreground">{selectedChain.steps.length}</p>
                </div>
              </div>
            </div>

            {/* Attack Steps Timeline */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Attack Path</h4>
              <div className="space-y-4 relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

                {selectedChain.steps.map((step, index) => {
                  const PhaseIcon = getPhaseIcon(step.phase)
                  return (
                    <div key={step.id} className="relative flex items-start space-x-4">
                      {/* Step Number & Icon */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full ${getSeverityColor(step.severity)} bg-opacity-20 border-2 ${getSeverityColor(step.severity)} flex items-center justify-center`}>
                          <PhaseIcon className={`w-5 h-5 ${getSeverityColor(step.severity).replace('bg-', 'text-')}`} />
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 bg-secondary rounded-lg p-4 border border-border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs font-semibold text-horns-blue uppercase">{step.phase}</p>
                            <h5 className="font-semibold text-card-foreground mt-1">{step.finding}</h5>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                            step.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                            step.severity === 'high' ? 'bg-orange-500/10 text-orange-400' :
                            step.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {step.severity}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            {step.source.map((src, i) => (
                              <span key={i} className="px-2 py-1 bg-card rounded border border-border text-card-foreground">
                                {src}
                              </span>
                            ))}
                          </div>
                          <span className="text-muted-foreground">{step.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-horns-blue/10 to-horns-purple/10 rounded-lg p-6 border border-horns-blue/30">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-5 h-5 text-horns-blue" />
                <h4 className="font-semibold text-card-foreground">AI Analysis</h4>
              </div>
              <p className="text-sm text-card-foreground mb-4">{selectedChain.aiInsight}</p>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Recommended Actions</p>
                {selectedChain.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-horns-blue mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-card-foreground">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Demo attack chains (based on production correlation engine output)
const demoChains: AttackChain[] = [
  {
    id: 'chain-001',
    name: 'Credential Compromise → Lateral Movement',
    riskScore: 92,
    confidence: 95,
    targetAsset: 'ACME-WS-042 (jsmith-laptop)',
    steps: [
      {
        id: 'step-001',
        phase: 'Reconnaissance',
        finding: 'Credential Leak on Dark Web',
        source: ['OSINT', 'Dark Web Monitor'],
        severity: 'high',
        timestamp: '2025-01-15 08:23',
        description: 'Employee credentials (jsmith@acme.com) found in stealer malware log dump on Russian forum'
      },
      {
        id: 'step-002',
        phase: 'Initial Access',
        finding: 'Suspicious Admin Login from Russia',
        source: ['CrowdSec', 'AbuseIPDB'],
        severity: 'critical',
        timestamp: '2025-01-16 23:45',
        description: 'Unauthorized admin access from IP 185.234.72.19 (Russia) using compromised credentials'
      },
      {
        id: 'step-003',
        phase: 'Execution',
        finding: 'Emotet Malware Detected',
        source: ['Contextal', 'Nuclei'],
        severity: 'critical',
        timestamp: '2025-01-17 08:23',
        description: 'Emotet variant detected on endpoint ACME-WS-042, likely dropped via compromised session'
      },
      {
        id: 'step-004',
        phase: 'Persistence',
        finding: 'Scheduled Task Created',
        source: ['Agent Telemetry'],
        severity: 'high',
        timestamp: '2025-01-17 08:45',
        description: 'Malware established persistence via scheduled task "SystemUpdate" running every 15 minutes'
      }
    ],
    aiInsight: 'This attack chain demonstrates a complete compromise path from credential exposure to active malware infection. The threat actor leveraged stolen credentials from a dark web marketplace to gain initial access, then deployed Emotet malware for persistence and lateral movement capabilities. The 48-hour window between credential leak and exploitation suggests automated tooling.',
    recommendations: [
      'Immediately isolate ACME-WS-042 and force password reset for jsmith@acme.com',
      'Enable MFA on all admin accounts to prevent credential-based attacks',
      'Block IP 185.234.72.19 and scan network for lateral movement indicators',
      'Deploy EDR on all endpoints to detect Emotet variants and scheduled task abuse'
    ]
  },
  {
    id: 'chain-002',
    name: 'Exchange Vulnerability → Domain Compromise',
    riskScore: 87,
    confidence: 88,
    targetAsset: 'EXCHANGE-01',
    steps: [
      {
        id: 'step-005',
        phase: 'Reconnaissance',
        finding: 'Exchange Server Version Detected',
        source: ['Nmap', 'HTTPx'],
        severity: 'medium',
        timestamp: '2025-01-10 14:32',
        description: 'Microsoft Exchange 2019 (vulnerable version) exposed on port 443 with OWA interface'
      },
      {
        id: 'step-006',
        phase: 'Initial Access',
        finding: 'CVE-2024-21410 Exploitation Attempt',
        source: ['Nuclei', 'CrowdSec'],
        severity: 'critical',
        timestamp: '2025-01-14 02:18',
        description: 'Active exploitation of Exchange elevation of privilege vulnerability detected from 203.0.113.45'
      },
      {
        id: 'step-007',
        phase: 'Privilege Escalation',
        finding: 'Domain Admin Token Harvested',
        source: ['Agent Telemetry'],
        severity: 'critical',
        timestamp: '2025-01-14 02:23',
        description: 'Attacker obtained SYSTEM-level access and extracted domain admin credentials from LSASS memory'
      }
    ],
    aiInsight: 'Classic unpatched vulnerability exploitation targeting Exchange Server. The attacker conducted reconnaissance to identify the vulnerable Exchange version, then leveraged CVE-2024-21410 to gain elevated privileges. This pattern matches APT activity observed in recent Exchange-focused campaigns.',
    recommendations: [
      'Apply Exchange Server security update KB5034441 immediately',
      'Rotate all domain admin credentials and monitor for Pass-the-Hash attacks',
      'Implement network segmentation to isolate Exchange servers',
      'Enable credential guard on domain controllers to prevent token theft'
    ]
  },
  {
    id: 'chain-003',
    name: 'VPN Access Request → Threat Actor Interest',
    riskScore: 65,
    confidence: 72,
    targetAsset: 'VPN Infrastructure',
    steps: [
      {
        id: 'step-008',
        phase: 'Reconnaissance',
        finding: 'VPN Gateway Fingerprinted',
        source: ['Shodan', 'HTTPx'],
        severity: 'low',
        timestamp: '2025-01-12 11:45',
        description: 'Acme Corporation VPN gateway identified on Shodan with SSL certificate metadata exposure'
      },
      {
        id: 'step-009',
        phase: 'Initial Access',
        finding: 'Dark Web VPN Access Offer',
        source: ['OSINT', 'BreachForums'],
        severity: 'high',
        timestamp: '2025-01-14 19:32',
        description: 'Threat actor posted on BreachForums requesting VPN access to "Acme Corp network" for $2,500'
      }
    ],
    aiInsight: 'Pre-attack reconnaissance indicating potential targeted campaign. Threat actors have identified Acme Corporation\'s VPN infrastructure and are actively seeking access through underground forums. This early-stage activity suggests a planned intrusion attempt.',
    recommendations: [
      'Implement VPN multi-factor authentication immediately',
      'Review VPN access logs for unusual authentication attempts',
      'Consider changing VPN SSL certificates to reduce fingerprinting',
      'Monitor dark web forums for mentions of company infrastructure'
    ]
  }
]

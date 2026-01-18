'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, CheckCircle, XCircle, Clock, TrendingUp, DollarSign } from 'lucide-react'
import { getApiUrl } from '@/lib/api'

const API_URL = getApiUrl()

interface SecurityTool {
  id: string
  name: string
  category: string
  status: 'healthy' | 'degraded' | 'offline'
  description: string
  capabilities: string[]
  replaces: string
  monthlySavings: number
  lastRun: string
  findingsCount: number
  icon: string
}

export default function SecurityToolsPage() {
  const [tools, setTools] = useState<SecurityTool[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch(`${API_URL}/api/security-tools/status`)
        const data = await response.json()
        setTools(data.tools)
      } catch (error) {
        // Use fallback data for demo
        setTools(demoToolsData)
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [])

  const categories = ['all', 'vulnerability', 'network', 'threat-intel', 'malware']
  const filteredTools = selectedCategory === 'all'
    ? tools
    : tools.filter(t => t.category === selectedCategory)

  const totalSavings = tools.reduce((sum, tool) => sum + tool.monthlySavings, 0)
  const healthyTools = tools.filter(t => t.status === 'healthy').length
  const totalFindings = tools.reduce((sum, tool) => sum + tool.findingsCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-card-foreground mb-2">Security Tools</h1>
        <p className="text-muted-foreground">
          Open-source security tool integrations replacing expensive commercial platforms
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Active Tools</p>
            <Activity className="w-5 h-5 text-horns-blue" />
          </div>
          <p className="text-3xl font-bold text-card-foreground">{healthyTools}/{tools.length}</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Monthly Savings</p>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-card-foreground">${totalSavings.toLocaleString()}</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Findings</p>
            <TrendingUp className="w-5 h-5 text-horns-purple" />
          </div>
          <p className="text-3xl font-bold text-card-foreground">{totalFindings.toLocaleString()}</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Last Scan</p>
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-lg font-bold text-card-foreground">2 mins ago</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-horns-blue text-white'
                : 'bg-card border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-horns-blue"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTools.map(tool => (
            <div key={tool.id} className="bg-card rounded-lg border border-border p-6 hover:border-horns-blue transition-colors">
              {/* Tool Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-card-foreground">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{tool.category.replace('-', ' ')}</p>
                  </div>
                </div>
                <StatusBadge status={tool.status} />
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>

              {/* Capabilities */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">CAPABILITIES</p>
                <div className="flex flex-wrap gap-2">
                  {tool.capabilities.map((cap, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-secondary rounded text-xs text-card-foreground border border-border"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Replaces</p>
                  <p className="text-sm font-semibold text-card-foreground">{tool.replaces}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Savings/mo</p>
                  <p className="text-sm font-semibold text-green-500">${tool.monthlySavings}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Findings</p>
                  <p className="text-sm font-semibold text-horns-purple">{tool.findingsCount}</p>
                </div>
              </div>

              {/* Last Run */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Last scan: <span className="text-card-foreground">{tool.lastRun}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    healthy: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Healthy' },
    degraded: { icon: Activity, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Degraded' },
    offline: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Offline' }
  }

  const { icon: Icon, color, bg, label } = config[status as keyof typeof config]

  return (
    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${bg}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-xs font-semibold ${color}`}>{label}</span>
    </div>
  )
}

// Demo data (matches production integrations)
const demoToolsData: SecurityTool[] = [
  {
    id: 'nuclei',
    name: 'Nuclei',
    category: 'vulnerability',
    status: 'healthy',
    description: 'Fast vulnerability scanner with 11,000+ templates for comprehensive security testing',
    capabilities: ['CVE Detection', 'Misconfigurations', 'Exposed Panels', 'Web Vulnerabilities'],
    replaces: 'Shodan',
    monthlySavings: 299,
    lastRun: '2 minutes ago',
    findingsCount: 127,
    icon: '🔍'
  },
  {
    id: 'nmap',
    name: 'Nmap',
    category: 'network',
    status: 'healthy',
    description: 'Network discovery and service detection for comprehensive infrastructure mapping',
    capabilities: ['Port Scanning', 'Service Detection', 'OS Fingerprinting', 'Network Topology'],
    replaces: 'Commercial Scanner',
    monthlySavings: 500,
    lastRun: '5 minutes ago',
    findingsCount: 89,
    icon: '🌐'
  },
  {
    id: 'httpx',
    name: 'HTTPx',
    category: 'network',
    status: 'healthy',
    description: 'Fast HTTP toolkit for web server detection and technology fingerprinting',
    capabilities: ['HTTP Probing', 'Tech Stack Detection', 'Web Server Analysis', 'SSL/TLS Info'],
    replaces: 'Commercial Tool',
    monthlySavings: 150,
    lastRun: '3 minutes ago',
    findingsCount: 234,
    icon: '🔗'
  },
  {
    id: 'subfinder',
    name: 'Subfinder',
    category: 'network',
    status: 'healthy',
    description: 'Passive subdomain discovery using multiple OSINT sources for attack surface mapping',
    capabilities: ['Subdomain Enumeration', 'DNS Discovery', 'Attack Surface Mapping', 'OSINT Aggregation'],
    replaces: 'OSINT Platform',
    monthlySavings: 100,
    lastRun: '10 minutes ago',
    findingsCount: 156,
    icon: '🔎'
  },
  {
    id: 'crowdsec',
    name: 'CrowdSec',
    category: 'threat-intel',
    status: 'healthy',
    description: 'Community-powered threat intelligence with real-time IP reputation and attack detection',
    capabilities: ['IP Reputation', 'Attack Detection', 'Community Intelligence', 'Blocklist Management'],
    replaces: 'TI Feed',
    monthlySavings: 200,
    lastRun: '1 minute ago',
    findingsCount: 342,
    icon: '🛡️'
  },
  {
    id: 'contextal',
    name: 'Contextal',
    category: 'malware',
    status: 'healthy',
    description: 'Behavioral malware analysis engine for detecting threats through execution patterns',
    capabilities: ['Behavioral Analysis', 'File Scanning', 'Threat Detection', 'Sandbox Execution'],
    replaces: 'VirusTotal Enterprise',
    monthlySavings: 60,
    lastRun: '4 minutes ago',
    findingsCount: 23,
    icon: '🦠'
  }
]

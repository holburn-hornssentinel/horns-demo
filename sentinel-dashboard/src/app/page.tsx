'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MetricCard from '@/components/MetricCard'
import SeverityBadge from '@/components/SeverityBadge'
import AIBadge from '@/components/AIBadge'
import { useToast } from '@/components/Toast'
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  Check,
  AlertOctagon
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getApiUrl } from '@/lib/api'

const API_URL = getApiUrl()

interface DashboardStats {
  security_score: number
  total_assets: number
  active_threats: number
  critical_alerts: number
  high_alerts: number
  medium_alerts: number
  low_alerts: number
  vulnerabilities_total: number
  vulnerabilities_critical: number
  osint_findings: number
  connected_agents: number
}

interface Alert {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: string
  title: string
  description: string
  affected_asset: string
  detected_at: string
  status: string
  tags?: string[]
  ai_confidence?: number
  ai_recommendation?: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          fetch(`${API_URL}/api/stats`),
          fetch(`${API_URL}/api/alerts?limit=5`)
        ])

        const statsData = await statsRes.json()
        const alertsData = await alertsRes.json()

        setStats(statsData)
        setRecentAlerts(alertsData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s

    return () => clearInterval(interval)
  }, [])

  // Action handlers
  const handleAcknowledge = async (alertId: string) => {
    setRecentAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, status: 'acknowledged' } : a
    ))
    if (selectedAlert?.id === alertId) {
      setSelectedAlert({ ...selectedAlert, status: 'acknowledged' })
    }

    toast.success('Alert acknowledged')

    try {
      await fetch(`${API_URL}/api/alerts/${alertId}/acknowledge`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const handleResolve = async (alertId: string) => {
    setRecentAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, status: 'resolved' } : a
    ))
    if (selectedAlert?.id === alertId) {
      setSelectedAlert({ ...selectedAlert, status: 'resolved' })
    }

    toast.success('Alert marked as resolved')

    try {
      await fetch(`${API_URL}/api/alerts/${alertId}/resolve`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const handleEscalate = async (alertId: string) => {
    setRecentAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, status: 'escalated' } : a
    ))
    if (selectedAlert?.id === alertId) {
      setSelectedAlert({ ...selectedAlert, status: 'escalated' })
    }

    toast.warning('Alert escalated to security team')

    try {
      await fetch(`${API_URL}/api/alerts/${alertId}/escalate`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to escalate alert:', error)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Security Operations Overview</h1>
        <p className="text-muted-foreground">Real-time security monitoring for Acme Corporation</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => setShowScoreModal(true)} className="cursor-pointer">
          <MetricCard
            title="Security Score"
            value={stats.security_score}
            icon={Shield}
            color="yellow"
            trend={{ value: 5, isPositive: true }}
          />
        </div>
        <div onClick={() => router.push('/threats')} className="cursor-pointer">
          <MetricCard
            title="Active Threats"
            value={stats.active_threats}
            icon={AlertTriangle}
            color="red"
          />
        </div>
        <div onClick={() => router.push('/agents')} className="cursor-pointer">
          <MetricCard
            title="Total Assets"
            value={stats.total_assets}
            icon={Activity}
            color="blue"
          />
        </div>
        <div onClick={() => router.push('/agents')} className="cursor-pointer">
          <MetricCard
            title="Connected Agents"
            value={stats.connected_agents}
            icon={TrendingUp}
            color="green"
          />
        </div>
      </div>

      {/* Alert Summary */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-card-foreground mb-4">Alert Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => router.push('/alerts?severity=critical')}
            className="text-center p-4 bg-secondary rounded-lg border border-red-500/20 cursor-pointer hover:border-red-500/50 transition-colors"
          >
            <p className="text-3xl font-bold text-red-400">{stats.critical_alerts}</p>
            <p className="text-sm text-muted-foreground mt-1">Critical</p>
          </div>
          <div
            onClick={() => router.push('/alerts?severity=high')}
            className="text-center p-4 bg-secondary rounded-lg border border-orange-500/20 cursor-pointer hover:border-orange-500/50 transition-colors"
          >
            <p className="text-3xl font-bold text-orange-400">{stats.high_alerts}</p>
            <p className="text-sm text-muted-foreground mt-1">High</p>
          </div>
          <div
            onClick={() => router.push('/alerts?severity=medium')}
            className="text-center p-4 bg-secondary rounded-lg border border-yellow-500/20 cursor-pointer hover:border-yellow-500/50 transition-colors"
          >
            <p className="text-3xl font-bold text-yellow-400">{stats.medium_alerts}</p>
            <p className="text-sm text-muted-foreground mt-1">Medium</p>
          </div>
          <div
            onClick={() => router.push('/alerts?severity=low')}
            className="text-center p-4 bg-secondary rounded-lg border border-blue-500/20 cursor-pointer hover:border-blue-500/50 transition-colors"
          >
            <p className="text-3xl font-bold text-blue-400">{stats.low_alerts}</p>
            <p className="text-sm text-muted-foreground mt-1">Low</p>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-card-foreground">Recent Alerts</h2>
          <a href="/alerts" className="text-primary hover:text-blue-300 text-sm">
            View All →
          </a>
        </div>
        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className="p-4 bg-secondary rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <SeverityBadge severity={alert.severity} size="sm" />
                    <span className="text-xs text-muted-foreground uppercase">{alert.type}</span>
                  </div>
                  <h3 className="text-card-foreground font-medium mb-1">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{alert.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span>{alert.affected_asset}</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(alert.detected_at), { addSuffix: true })}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerabilities & OSINT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          onClick={() => router.push('/threats')}
          className="bg-card rounded-lg p-6 border border-border cursor-pointer hover:border-primary transition-colors"
        >
          <h2 className="text-xl font-bold text-card-foreground mb-4">Vulnerabilities</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary rounded">
              <span className="text-foreground">Total CVEs</span>
              <span className="text-2xl font-bold text-card-foreground">{stats.vulnerabilities_total}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded">
              <span className="text-foreground">Critical</span>
              <span className="text-2xl font-bold text-red-400">{stats.vulnerabilities_critical}</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => router.push('/osint')}
          className="bg-card rounded-lg p-6 border border-border cursor-pointer hover:border-primary transition-colors"
        >
          <h2 className="text-xl font-bold text-card-foreground mb-4">OSINT Findings</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary rounded">
              <span className="text-foreground">Total Findings</span>
              <span className="text-2xl font-bold text-card-foreground">{stats.osint_findings}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded">
              <span className="text-foreground">Credential Leaks</span>
              <span className="text-2xl font-bold text-red-400">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAlert(null)}>
          <div className="bg-card rounded-lg max-w-2xl w-full border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <SeverityBadge severity={selectedAlert.severity} />
                    <span className="text-sm text-muted-foreground uppercase">{selectedAlert.type}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground">{selectedAlert.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-muted-foreground hover:text-card-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* AI Recommendation */}
              {selectedAlert.ai_confidence && selectedAlert.ai_recommendation && (
                <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">AI Recommendation</h3>
                  <AIBadge
                    confidence={selectedAlert.ai_confidence}
                    recommendation={selectedAlert.ai_recommendation}
                  />
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-card-foreground">{selectedAlert.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Affected Asset</h3>
                  <p className="text-card-foreground">{selectedAlert.affected_asset}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <span className="px-3 py-1 text-sm rounded-full bg-secondary text-foreground capitalize">
                    {selectedAlert.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Alert ID</h3>
                  <p className="text-card-foreground font-mono text-sm">{selectedAlert.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Detected</h3>
                  <p className="text-card-foreground text-sm">
                    {formatDistanceToNow(new Date(selectedAlert.detected_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {selectedAlert.tags && selectedAlert.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs rounded-full bg-secondary text-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                {selectedAlert.status !== 'acknowledged' && selectedAlert.status !== 'resolved' && (
                  <button
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Acknowledge
                  </button>
                )}
                {selectedAlert.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolve(selectedAlert.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Resolve
                  </button>
                )}
                {selectedAlert.status !== 'escalated' && selectedAlert.severity === 'critical' && (
                  <button
                    onClick={() => handleEscalate(selectedAlert.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg transition-colors"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    Escalate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Score Breakdown Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowScoreModal(false)}>
          <div className="bg-card rounded-lg max-w-2xl w-full border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">Security Score Breakdown</h2>
                  <p className="text-sm text-muted-foreground mt-1">Current score: {stats.security_score}/100</p>
                </div>
                <button
                  onClick={() => setShowScoreModal(false)}
                  className="text-muted-foreground hover:text-card-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-card-foreground">Vulnerability Management</h3>
                    <p className="text-xs text-muted-foreground">Critical vulnerabilities detected</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-orange-400">65</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-card-foreground">Patch Compliance</h3>
                    <p className="text-xs text-muted-foreground">Systems up to date</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-green-400">85</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-card-foreground">Access Control</h3>
                    <p className="text-xs text-muted-foreground">Identity and access management</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-green-400">90</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-card-foreground">Network Security</h3>
                    <p className="text-xs text-muted-foreground">Firewall and intrusion detection</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-yellow-400">78</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-card-foreground">Data Protection</h3>
                    <p className="text-xs text-muted-foreground">Encryption and backup status</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-green-400">92</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-card-foreground">Incident Response</h3>
                    <p className="text-xs text-muted-foreground">Response time and coverage</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-yellow-400">72</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Security Score</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-yellow-400">{stats.security_score}</span>
                    <span className="text-green-400 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +5%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Score improved by 5 points this week. Focus on reducing critical vulnerabilities to increase your score.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

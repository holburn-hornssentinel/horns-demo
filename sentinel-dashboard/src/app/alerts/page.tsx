'use client'

import { useEffect, useState } from 'react'
import SeverityBadge from '@/components/SeverityBadge'
import AIBadge from '@/components/AIBadge'
import { useToast } from '@/components/Toast'
import { Search, Filter, Clock, AlertTriangle, Check, Shield, AlertOctagon, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getApiUrl } from '@/lib/api'

const API_URL = getApiUrl()

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

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assetFilter, setAssetFilter] = useState<string>('')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const toast = useToast()

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch(`${API_URL}/api/alerts?limit=100`)
        const data = await response.json()
        setAlerts(data)
        setFilteredAlerts(data)
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  useEffect(() => {
    let filtered = alerts

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.affected_asset.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter)
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter)
    }

    // Apply asset filter
    if (assetFilter) {
      filtered = filtered.filter(alert => alert.affected_asset === assetFilter)
    }

    setFilteredAlerts(filtered)
  }, [searchQuery, severityFilter, statusFilter, assetFilter, alerts])

  // Filter handlers
  const handleSeverityCardClick = (severity: string) => {
    // Toggle behavior: clicking the same severity clears the filter
    if (severityFilter === severity) {
      setSeverityFilter('all')
    } else {
      setSeverityFilter(severity)
    }
  }

  const handleAssetClick = (asset: string, event: React.MouseEvent) => {
    // Prevent row click from triggering
    event.stopPropagation()

    // Toggle behavior: clicking the same asset clears the filter
    if (assetFilter === asset) {
      setAssetFilter('')
    } else {
      setAssetFilter(asset)
    }
  }

  const clearAssetFilter = () => {
    setAssetFilter('')
  }

  // Action handlers
  const handleAcknowledge = async (alertId: string) => {
    // Optimistic update
    setAlerts(prev => prev.map(a =>
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
    // Optimistic update
    setAlerts(prev => prev.map(a =>
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
    // Optimistic update
    setAlerts(prev => prev.map(a =>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-card-foreground mb-2">Security Alerts</h1>
        <p className="text-muted-foreground">Monitor and investigate security incidents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['critical', 'high', 'medium', 'low'].map((severity) => {
          const count = alerts.filter(a => a.severity === severity).length
          const isActive = severityFilter === severity
          const colors = {
            critical: 'border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10',
            high: 'border-orange-500/20 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10',
            medium: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400 hover:bg-yellow-500/10',
            low: 'border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10',
          }
          const activeColors = {
            critical: 'border-red-500/40 bg-red-500/15 ring-2 ring-red-500/30',
            high: 'border-orange-500/40 bg-orange-500/15 ring-2 ring-orange-500/30',
            medium: 'border-yellow-500/40 bg-yellow-500/15 ring-2 ring-yellow-500/30',
            low: 'border-blue-500/40 bg-blue-500/15 ring-2 ring-blue-500/30',
          }
          return (
            <div
              key={severity}
              onClick={() => handleSeverityCardClick(severity)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${colors[severity as keyof typeof colors]} ${isActive ? activeColors[severity as keyof typeof activeColors] : ''}`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm capitalize mt-1">{severity}</p>
              {isActive && (
                <p className="text-xs mt-1 opacity-70">Click to clear</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-card-foreground placeholder-gray-500 focus:outline-none focus:border-horns-blue"
            />
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 bg-secondary border border-border rounded-lg text-card-foreground focus:outline-none focus:border-horns-blue"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-secondary border border-border rounded-lg text-card-foreground focus:outline-none focus:border-horns-blue"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="mitigated">Mitigated</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        {/* Asset Filter Chip */}
        {assetFilter && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-horns-blue/10 border border-horns-blue/30 rounded-full text-horns-blue text-sm">
              <span>Asset: {assetFilter}</span>
              <button
                onClick={clearAssetFilter}
                className="hover:bg-horns-blue/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alerts Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Severity</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Alert</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Asset</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-horns-light">
              {filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className="hover:bg-secondary transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <SeverityBadge severity={alert.severity} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-card-foreground font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{alert.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => handleAssetClick(alert.affected_asset, e)}
                      className={`text-sm transition-colors hover:text-horns-blue cursor-pointer text-left ${assetFilter === alert.affected_asset ? 'text-horns-blue font-medium' : 'text-foreground'}`}
                    >
                      {alert.affected_asset}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-secondary text-foreground capitalize">
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.detected_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-muted-foreground">No alerts match your filters</p>
        </div>
      )}

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
    </div>
  )
}

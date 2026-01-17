'use client'

import { useEffect, useState } from 'react'
import SeverityBadge from '@/components/SeverityBadge'
import { Search, Filter, Clock, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

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

    setFilteredAlerts(filtered)
  }, [searchQuery, severityFilter, statusFilter, alerts])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-horns-blue animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Security Alerts</h1>
        <p className="text-gray-400">Monitor and investigate security incidents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['critical', 'high', 'medium', 'low'].map((severity) => {
          const count = alerts.filter(a => a.severity === severity).length
          const colors = {
            critical: 'border-red-500/20 bg-red-500/5 text-red-400',
            high: 'border-orange-500/20 bg-orange-500/5 text-orange-400',
            medium: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400',
            low: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
          }
          return (
            <div key={severity} className={`p-4 rounded-lg border ${colors[severity as keyof typeof colors]}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm capitalize mt-1">{severity}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-horns-gray rounded-lg p-4 border border-horns-light">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-horns-dark border border-horns-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-horns-blue"
            />
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 bg-horns-dark border border-horns-light rounded-lg text-white focus:outline-none focus:border-horns-blue"
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
            className="px-4 py-2 bg-horns-dark border border-horns-light rounded-lg text-white focus:outline-none focus:border-horns-blue"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="mitigated">Mitigated</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-horns-gray rounded-lg border border-horns-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-horns-dark border-b border-horns-light">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Severity</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Alert</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Asset</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-horns-light">
              {filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className="hover:bg-horns-dark transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <SeverityBadge severity={alert.severity} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{alert.title}</p>
                      <p className="text-sm text-gray-400 line-clamp-1">{alert.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{alert.affected_asset}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-horns-dark text-gray-300 capitalize">
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
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
          <p className="text-gray-400">No alerts match your filters</p>
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAlert(null)}>
          <div className="bg-horns-gray rounded-lg max-w-2xl w-full border border-horns-light" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-horns-light">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <SeverityBadge severity={selectedAlert.severity} />
                    <span className="text-sm text-gray-400 uppercase">{selectedAlert.type}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedAlert.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                <p className="text-white">{selectedAlert.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Affected Asset</h3>
                  <p className="text-white">{selectedAlert.affected_asset}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
                  <span className="px-3 py-1 text-sm rounded-full bg-horns-dark text-gray-300 capitalize">
                    {selectedAlert.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Alert ID</h3>
                  <p className="text-white font-mono text-sm">{selectedAlert.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Detected</h3>
                  <p className="text-white text-sm">
                    {formatDistanceToNow(new Date(selectedAlert.detected_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {selectedAlert.tags && selectedAlert.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs rounded-full bg-horns-dark text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

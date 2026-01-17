'use client'

import { useEffect, useState } from 'react'
import MetricCard from '@/components/MetricCard'
import SeverityBadge from '@/components/SeverityBadge'
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-horns-blue animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Security Operations Overview</h1>
        <p className="text-gray-400">Real-time security monitoring for Acme Corporation</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Security Score"
          value={stats.security_score}
          icon={Shield}
          color="yellow"
          trend={{ value: 5, isPositive: true }}
        />
        <MetricCard
          title="Active Threats"
          value={stats.active_threats}
          icon={AlertTriangle}
          color="red"
        />
        <MetricCard
          title="Total Assets"
          value={stats.total_assets}
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="Connected Agents"
          value={stats.connected_agents}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Alert Summary */}
      <div className="bg-horns-gray rounded-lg p-6 border border-horns-light">
        <h2 className="text-xl font-bold text-white mb-4">Alert Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-horns-dark rounded-lg border border-red-500/20">
            <p className="text-3xl font-bold text-red-400">{stats.critical_alerts}</p>
            <p className="text-sm text-gray-400 mt-1">Critical</p>
          </div>
          <div className="text-center p-4 bg-horns-dark rounded-lg border border-orange-500/20">
            <p className="text-3xl font-bold text-orange-400">{stats.high_alerts}</p>
            <p className="text-sm text-gray-400 mt-1">High</p>
          </div>
          <div className="text-center p-4 bg-horns-dark rounded-lg border border-yellow-500/20">
            <p className="text-3xl font-bold text-yellow-400">{stats.medium_alerts}</p>
            <p className="text-sm text-gray-400 mt-1">Medium</p>
          </div>
          <div className="text-center p-4 bg-horns-dark rounded-lg border border-blue-500/20">
            <p className="text-3xl font-bold text-blue-400">{stats.low_alerts}</p>
            <p className="text-sm text-gray-400 mt-1">Low</p>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-horns-gray rounded-lg p-6 border border-horns-light">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Alerts</h2>
          <a href="/alerts" className="text-horns-blue hover:text-blue-300 text-sm">
            View All →
          </a>
        </div>
        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 bg-horns-dark rounded-lg border border-horns-light hover:border-horns-blue transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <SeverityBadge severity={alert.severity} size="sm" />
                    <span className="text-xs text-gray-400 uppercase">{alert.type}</span>
                  </div>
                  <h3 className="text-white font-medium mb-1">{alert.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-1">{alert.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
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
        <div className="bg-horns-gray rounded-lg p-6 border border-horns-light">
          <h2 className="text-xl font-bold text-white mb-4">Vulnerabilities</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-horns-dark rounded">
              <span className="text-gray-300">Total CVEs</span>
              <span className="text-2xl font-bold text-white">{stats.vulnerabilities_total}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-horns-dark rounded">
              <span className="text-gray-300">Critical</span>
              <span className="text-2xl font-bold text-red-400">{stats.vulnerabilities_critical}</span>
            </div>
          </div>
        </div>

        <div className="bg-horns-gray rounded-lg p-6 border border-horns-light">
          <h2 className="text-xl font-bold text-white mb-4">OSINT Findings</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-horns-dark rounded">
              <span className="text-gray-300">Total Findings</span>
              <span className="text-2xl font-bold text-white">{stats.osint_findings}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-horns-dark rounded">
              <span className="text-gray-300">Credential Leaks</span>
              <span className="text-2xl font-bold text-red-400">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

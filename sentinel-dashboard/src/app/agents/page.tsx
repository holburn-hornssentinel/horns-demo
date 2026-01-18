'use client'

import { useEffect, useState } from 'react'
import { Server, Activity, AlertCircle, CheckCircle, XCircle, Cloud, HardDrive, Shield } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { getApiUrl } from '@/lib/api'

const API_URL = getApiUrl()

interface Agent {
  id: string
  name: string
  hostname: string
  deployment_mode: string
  status: string
  last_checkin: string
  version: string
  tags: {
    [key: string]: string
  }
  metrics: {
    cpu_usage: number
    memory_usage: number
    disk_usage: number
    network_rx_mbps: number
    network_tx_mbps: number
    containers_running: number
    services_monitored: number
  }
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deploymentFilter, setDeploymentFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('')

  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await fetch(`${API_URL}/api/agents`)
        const data = await response.json()
        setAgents(data)
      } catch (error) {
        console.error('Failed to fetch agents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
    const interval = setInterval(fetchAgents, 15000) // Refresh every 15s

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Server className="w-12 h-12 text-primary animate-pulse" />
      </div>
    )
  }

  const stats = {
    total: agents.length,
    online: agents.filter(a => a.status === 'online').length,
    warning: agents.filter(a => a.status === 'warning').length,
    offline: agents.filter(a => a.status === 'offline').length,
  }

  const deploymentModes = {
    saas: agents.filter(a => a.deployment_mode === 'saas').length,
    on_premise: agents.filter(a => a.deployment_mode === 'on_premise').length,
    standalone: agents.filter(a => a.deployment_mode === 'standalone').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Activity className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getDeploymentIcon = (mode: string) => {
    switch (mode) {
      case 'saas':
        return <Cloud className="w-5 h-5 text-blue-400" />
      case 'on_premise':
        return <Shield className="w-5 h-5 text-purple-400" />
      case 'standalone':
        return <HardDrive className="w-5 h-5 text-green-400" />
      default:
        return <Server className="w-5 h-5 text-muted-foreground" />
    }
  }

  // Filter agents based on active filters
  const filteredAgents = agents.filter((agent) => {
    // Status filter
    if (statusFilter !== 'all' && agent.status !== statusFilter) {
      return false
    }

    // Deployment filter
    if (deploymentFilter !== 'all' && agent.deployment_mode !== deploymentFilter) {
      return false
    }

    // Tag filter
    if (tagFilter) {
      const hasTag = Object.entries(agent.tags).some(
        ([key, value]) => `${key}: ${value}` === tagFilter
      )
      if (!hasTag) return false
    }

    return true
  })

  const handleStatusClick = (status: string) => {
    setStatusFilter(status)
  }

  const handleDeploymentClick = (mode: string) => {
    setDeploymentFilter(mode)
  }

  const handleTagClick = (key: string, value: string) => {
    const tag = `${key}: ${value}`
    setTagFilter(tag)
    setSelectedAgent(null) // Close modal
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setDeploymentFilter('all')
    setTagFilter('')
  }

  const hasActiveFilters = statusFilter !== 'all' || deploymentFilter !== 'all' || tagFilter !== ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-card-foreground mb-2">Agent Fleet Management</h1>
        <p className="text-muted-foreground">Monitor and manage security agents across your infrastructure</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => handleStatusClick('all')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/50'
              : 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40'
          }`}
        >
          <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Agents</p>
        </div>
        <div
          onClick={() => handleStatusClick('online')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            statusFilter === 'online'
              ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500/50'
              : 'border-green-500/20 bg-green-500/5 hover:border-green-500/40'
          }`}
        >
          <p className="text-2xl font-bold text-green-400">{stats.online}</p>
          <p className="text-sm text-muted-foreground mt-1">Online</p>
        </div>
        <div
          onClick={() => handleStatusClick('warning')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            statusFilter === 'warning'
              ? 'border-yellow-500 bg-yellow-500/10 ring-2 ring-yellow-500/50'
              : 'border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40'
          }`}
        >
          <p className="text-2xl font-bold text-yellow-400">{stats.warning}</p>
          <p className="text-sm text-muted-foreground mt-1">Warning</p>
        </div>
        <div
          onClick={() => handleStatusClick('offline')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            statusFilter === 'offline'
              ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/50'
              : 'border-red-500/20 bg-red-500/5 hover:border-red-500/40'
          }`}
        >
          <p className="text-2xl font-bold text-red-400">{stats.offline}</p>
          <p className="text-sm text-muted-foreground mt-1">Offline</p>
        </div>
      </div>

      {/* Deployment Models */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-card-foreground mb-4">Deployment Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => handleDeploymentClick('saas')}
            className={`p-4 bg-secondary rounded-lg border cursor-pointer transition-all ${
              deploymentFilter === 'saas'
                ? 'border-blue-500 ring-2 ring-blue-500/50'
                : 'border-blue-500/20 hover:border-blue-500/40'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Cloud className="w-6 h-6 text-blue-400" />
              <h3 className="font-medium text-card-foreground">SaaS Mode</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Agents connect to cloud platform. Zero infrastructure for customer.
            </p>
            <p className="text-2xl font-bold text-blue-400">{deploymentModes.saas}</p>
          </div>

          <div
            onClick={() => handleDeploymentClick('on_premise')}
            className={`p-4 bg-secondary rounded-lg border cursor-pointer transition-all ${
              deploymentFilter === 'on_premise'
                ? 'border-purple-500 ring-2 ring-purple-500/50'
                : 'border-purple-500/20 hover:border-purple-500/40'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-6 h-6 text-purple-400" />
              <h3 className="font-medium text-card-foreground">On-Premise</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Data stays in customer network. For regulated industries.
            </p>
            <p className="text-2xl font-bold text-purple-400">{deploymentModes.on_premise}</p>
          </div>

          <div
            onClick={() => handleDeploymentClick('standalone')}
            className={`p-4 bg-secondary rounded-lg border cursor-pointer transition-all ${
              deploymentFilter === 'standalone'
                ? 'border-green-500 ring-2 ring-green-500/50'
                : 'border-green-500/20 hover:border-green-500/40'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <HardDrive className="w-6 h-6 text-green-400" />
              <h3 className="font-medium text-card-foreground">Standalone</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Complete network isolation. Air-gapped environments.
            </p>
            <p className="text-2xl font-bold text-green-400">{deploymentModes.standalone}</p>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
              {statusFilter !== 'all' && (
                <span className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/20">
                  Status: {statusFilter}
                </span>
              )}
              {deploymentFilter !== 'all' && (
                <span className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/20">
                  Deployment: {deploymentFilter.replace('_', '-')}
                </span>
              )}
              {tagFilter && (
                <span className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/20">
                  Tag: {tagFilter}
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-card-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAgents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No agents match the current filters</p>
          </div>
        ) : (
          filteredAgents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(agent.status)}
                  <h3 className="text-lg font-bold text-card-foreground">{agent.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{agent.hostname}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getDeploymentIcon(agent.deployment_mode)}
                <span className="text-xs text-muted-foreground capitalize">
                  {agent.deployment_mode.replace('_', '-')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">CPU</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        agent.metrics.cpu_usage > 80 ? 'bg-red-500' :
                        agent.metrics.cpu_usage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${agent.metrics.cpu_usage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-card-foreground">{agent.metrics.cpu_usage.toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Memory</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        agent.metrics.memory_usage > 80 ? 'bg-red-500' :
                        agent.metrics.memory_usage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${agent.metrics.memory_usage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-card-foreground">{agent.metrics.memory_usage.toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Disk</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        agent.metrics.disk_usage > 80 ? 'bg-red-500' :
                        agent.metrics.disk_usage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${agent.metrics.disk_usage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-card-foreground">{agent.metrics.disk_usage.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>v{agent.version}</span>
              <span>{agent.metrics.containers_running} containers</span>
              <span>
                {agent.status === 'online'
                  ? formatDistanceToNow(new Date(agent.last_checkin), { addSuffix: true })
                  : 'Offline'
                }
              </span>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAgent(null)}>
          <div className="bg-card rounded-lg max-w-3xl w-full border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(selectedAgent.status)}
                    <h2 className="text-2xl font-bold text-card-foreground">{selectedAgent.name}</h2>
                  </div>
                  <p className="text-muted-foreground">{selectedAgent.hostname}</p>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-muted-foreground hover:text-card-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Deployment Mode</h3>
                  <div className="flex items-center space-x-2">
                    {getDeploymentIcon(selectedAgent.deployment_mode)}
                    <span className="text-card-foreground capitalize">{selectedAgent.deployment_mode.replace('_', '-')}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Version</h3>
                  <p className="text-card-foreground">v{selectedAgent.version}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Check-in</h3>
                  <p className="text-card-foreground">
                    {selectedAgent.status === 'online'
                      ? formatDistanceToNow(new Date(selectedAgent.last_checkin), { addSuffix: true })
                      : 'Offline'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Services Monitored</h3>
                  <p className="text-card-foreground">{selectedAgent.metrics.services_monitored}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Resource Usage</h3>
                <div className="space-y-3">
                  {[
                    { label: 'CPU Usage', value: selectedAgent.metrics.cpu_usage },
                    { label: 'Memory Usage', value: selectedAgent.metrics.memory_usage },
                    { label: 'Disk Usage', value: selectedAgent.metrics.disk_usage },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span className="text-card-foreground">{metric.value.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            metric.value > 80 ? 'bg-red-500' :
                            metric.value > 60 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Network Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary rounded">
                    <p className="text-xs text-muted-foreground mb-1">RX</p>
                    <p className="text-card-foreground">{selectedAgent.metrics.network_rx_mbps.toFixed(1)} Mbps</p>
                  </div>
                  <div className="p-3 bg-secondary rounded">
                    <p className="text-xs text-muted-foreground mb-1">TX</p>
                    <p className="text-card-foreground">{selectedAgent.metrics.network_tx_mbps.toFixed(1)} Mbps</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedAgent.tags).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleTagClick(key, value)}
                      className="px-3 py-1 text-sm rounded-full bg-secondary text-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                    >
                      {key}: {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

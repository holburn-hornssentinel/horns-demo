'use client'

import { useEffect, useState } from 'react'
import { Server, Activity, AlertCircle, CheckCircle, XCircle, Cloud, HardDrive, Shield } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
        <Server className="w-12 h-12 text-horns-blue animate-pulse" />
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
        return <Activity className="w-5 h-5 text-gray-400" />
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
        return <Server className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Agent Fleet Management</h1>
        <p className="text-gray-400">Monitor and manage security agents across your infrastructure</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
          <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
          <p className="text-sm text-gray-400 mt-1">Total Agents</p>
        </div>
        <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
          <p className="text-2xl font-bold text-green-400">{stats.online}</p>
          <p className="text-sm text-gray-400 mt-1">Online</p>
        </div>
        <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
          <p className="text-2xl font-bold text-yellow-400">{stats.warning}</p>
          <p className="text-sm text-gray-400 mt-1">Warning</p>
        </div>
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <p className="text-2xl font-bold text-red-400">{stats.offline}</p>
          <p className="text-sm text-gray-400 mt-1">Offline</p>
        </div>
      </div>

      {/* Deployment Models */}
      <div className="bg-horns-gray rounded-lg p-6 border border-horns-light">
        <h2 className="text-xl font-bold text-white mb-4">Deployment Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-horns-dark rounded-lg border border-blue-500/20">
            <div className="flex items-center space-x-3 mb-2">
              <Cloud className="w-6 h-6 text-blue-400" />
              <h3 className="font-medium text-white">SaaS Mode</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Agents connect to cloud platform. Zero infrastructure for customer.
            </p>
            <p className="text-2xl font-bold text-blue-400">{deploymentModes.saas}</p>
          </div>

          <div className="p-4 bg-horns-dark rounded-lg border border-purple-500/20">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-6 h-6 text-purple-400" />
              <h3 className="font-medium text-white">On-Premise</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Data stays in customer network. For regulated industries.
            </p>
            <p className="text-2xl font-bold text-purple-400">{deploymentModes.on_premise}</p>
          </div>

          <div className="p-4 bg-horns-dark rounded-lg border border-green-500/20">
            <div className="flex items-center space-x-3 mb-2">
              <HardDrive className="w-6 h-6 text-green-400" />
              <h3 className="font-medium text-white">Standalone</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Complete network isolation. Air-gapped environments.
            </p>
            <p className="text-2xl font-bold text-green-400">{deploymentModes.standalone}</p>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className="bg-horns-gray rounded-lg p-6 border border-horns-light hover:border-horns-blue transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(agent.status)}
                  <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                </div>
                <p className="text-sm text-gray-400">{agent.hostname}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getDeploymentIcon(agent.deployment_mode)}
                <span className="text-xs text-gray-400 capitalize">
                  {agent.deployment_mode.replace('_', '-')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">CPU</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-horns-dark rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        agent.metrics.cpu_usage > 80 ? 'bg-red-500' :
                        agent.metrics.cpu_usage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${agent.metrics.cpu_usage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-white">{agent.metrics.cpu_usage.toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Memory</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-horns-dark rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        agent.metrics.memory_usage > 80 ? 'bg-red-500' :
                        agent.metrics.memory_usage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${agent.metrics.memory_usage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-white">{agent.metrics.memory_usage.toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Disk</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-horns-dark rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        agent.metrics.disk_usage > 80 ? 'bg-red-500' :
                        agent.metrics.disk_usage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${agent.metrics.disk_usage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-white">{agent.metrics.disk_usage.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
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
        ))}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAgent(null)}>
          <div className="bg-horns-gray rounded-lg max-w-3xl w-full border border-horns-light" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-horns-light">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(selectedAgent.status)}
                    <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                  </div>
                  <p className="text-gray-400">{selectedAgent.hostname}</p>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Deployment Mode</h3>
                  <div className="flex items-center space-x-2">
                    {getDeploymentIcon(selectedAgent.deployment_mode)}
                    <span className="text-white capitalize">{selectedAgent.deployment_mode.replace('_', '-')}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Version</h3>
                  <p className="text-white">v{selectedAgent.version}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Last Check-in</h3>
                  <p className="text-white">
                    {selectedAgent.status === 'online'
                      ? formatDistanceToNow(new Date(selectedAgent.last_checkin), { addSuffix: true })
                      : 'Offline'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Services Monitored</h3>
                  <p className="text-white">{selectedAgent.metrics.services_monitored}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Resource Usage</h3>
                <div className="space-y-3">
                  {[
                    { label: 'CPU Usage', value: selectedAgent.metrics.cpu_usage },
                    { label: 'Memory Usage', value: selectedAgent.metrics.memory_usage },
                    { label: 'Disk Usage', value: selectedAgent.metrics.disk_usage },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{metric.label}</span>
                        <span className="text-white">{metric.value.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-horns-dark rounded-full h-3">
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
                <h3 className="text-sm font-medium text-gray-400 mb-2">Network Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-horns-dark rounded">
                    <p className="text-xs text-gray-500 mb-1">RX</p>
                    <p className="text-white">{selectedAgent.metrics.network_rx_mbps.toFixed(1)} Mbps</p>
                  </div>
                  <div className="p-3 bg-horns-dark rounded">
                    <p className="text-xs text-gray-500 mb-1">TX</p>
                    <p className="text-white">{selectedAgent.metrics.network_tx_mbps.toFixed(1)} Mbps</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedAgent.tags).map(([key, value]) => (
                    <span key={key} className="px-3 py-1 text-sm rounded-full bg-horns-dark text-gray-300">
                      {key}: {value}
                    </span>
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

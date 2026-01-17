'use client'

import { useEffect, useState } from 'react'
import SeverityBadge from '@/components/SeverityBadge'
import { Eye, Search, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface OSINTFinding {
  id: string
  type: string
  source: string
  finding: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  discovered_at: string
  verified: boolean
}

export default function OSINTPage() {
  const [findings, setFindings] = useState<OSINTFinding[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    async function fetchFindings() {
      try {
        const response = await fetch(`${API_URL}/api/osint`)
        const data = await response.json()
        setFindings(data)
      } catch (error) {
        console.error('Failed to fetch OSINT findings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFindings()
  }, [])

  const filteredFindings = findings.filter(f => {
    const matchesSearch = f.finding.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.source.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || f.type === typeFilter

    return matchesSearch && matchesType
  })

  const findingTypes = Array.from(new Set(findings.map(f => f.type)))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Eye className="w-12 h-12 text-horns-blue animate-pulse" />
      </div>
    )
  }

  const stats = {
    total: findings.length,
    verified: findings.filter(f => f.verified).length,
    credential_leaks: findings.filter(f => f.type === 'credential_leak').length,
    dark_web: findings.filter(f => f.type === 'dark_web_mention').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">OSINT Findings</h1>
        <p className="text-gray-400">Open-source intelligence and brand monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
          <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
          <p className="text-sm text-gray-400 mt-1">Total Findings</p>
        </div>
        <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
          <p className="text-2xl font-bold text-green-400">{stats.verified}</p>
          <p className="text-sm text-gray-400 mt-1">Verified</p>
        </div>
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <p className="text-2xl font-bold text-red-400">{stats.credential_leaks}</p>
          <p className="text-sm text-gray-400 mt-1">Credential Leaks</p>
        </div>
        <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
          <p className="text-2xl font-bold text-purple-400">{stats.dark_web}</p>
          <p className="text-sm text-gray-400 mt-1">Dark Web Mentions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-horns-gray rounded-lg p-4 border border-horns-light">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-horns-dark border border-horns-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-horns-blue"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-horns-dark border border-horns-light rounded-lg text-white focus:outline-none focus:border-horns-blue"
          >
            <option value="all">All Types</option>
            {findingTypes.map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding) => (
          <div
            key={finding.id}
            className="bg-horns-gray rounded-lg p-6 border border-horns-light hover:border-horns-blue transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <SeverityBadge severity={finding.severity} size="sm" />
                <span className="px-3 py-1 text-xs rounded-full bg-horns-dark text-gray-300 capitalize">
                  {finding.type.replace(/_/g, ' ')}
                </span>
                {finding.verified ? (
                  <span className="flex items-center space-x-1 text-green-400 text-xs">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-yellow-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>Unverified</span>
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(finding.discovered_at), { addSuffix: true })}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Source: {finding.source}</span>
              </div>
              <p className="text-white font-mono text-sm bg-horns-dark p-3 rounded">
                {finding.finding}
              </p>
            </div>

            {finding.type === 'credential_leak' && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
                <p className="text-sm text-red-400">
                  <strong>Action Required:</strong> Immediately reset affected credentials and enable MFA if not already active.
                </p>
              </div>
            )}

            {finding.type === 'dark_web_mention' && (
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded">
                <p className="text-sm text-purple-400">
                  <strong>Monitoring:</strong> This finding is being actively monitored for escalation or additional context.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFindings.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No OSINT findings match your filters</p>
        </div>
      )}
    </div>
  )
}

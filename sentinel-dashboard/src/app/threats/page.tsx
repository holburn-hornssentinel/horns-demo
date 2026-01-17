'use client'

import { useEffect, useState } from 'react'
import SeverityBadge from '@/components/SeverityBadge'
import { Shield, Search } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Vulnerability {
  cve_id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  cvss_score: number
  title: string
  description: string
  affected_systems: string[]
  published_date: string
  patched: boolean
  patch_available: boolean
}

interface ThreatIntel {
  id: string
  type: string
  indicator: string
  description: string
  first_seen: string
  last_seen: string
  confidence: string
  tags: string[]
}

export default function ThreatsPage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [threats, setThreats] = useState<ThreatIntel[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'vulnerabilities' | 'intel'>('vulnerabilities')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [vulnRes, threatRes] = await Promise.all([
          fetch(`${API_URL}/api/vulnerabilities`),
          fetch(`${API_URL}/api/threats`)
        ])
        setVulnerabilities(await vulnRes.json())
        setThreats(await threatRes.json())
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredVulnerabilities = vulnerabilities.filter(v =>
    v.cve_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredThreats = threats.filter(t =>
    t.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Shield className="w-12 h-12 text-horns-blue animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Threat Intelligence</h1>
        <p className="text-gray-400">CVE tracking and threat indicators</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <p className="text-2xl font-bold text-red-400">
            {vulnerabilities.filter(v => v.severity === 'critical').length}
          </p>
          <p className="text-sm text-gray-400 mt-1">Critical CVEs</p>
        </div>
        <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
          <p className="text-2xl font-bold text-yellow-400">
            {vulnerabilities.filter(v => !v.patched).length}
          </p>
          <p className="text-sm text-gray-400 mt-1">Unpatched</p>
        </div>
        <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
          <p className="text-2xl font-bold text-blue-400">{threats.length}</p>
          <p className="text-sm text-gray-400 mt-1">Threat IOCs</p>
        </div>
        <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
          <p className="text-2xl font-bold text-green-400">
            {threats.filter(t => t.confidence === 'high').length}
          </p>
          <p className="text-sm text-gray-400 mt-1">High Confidence</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-horns-light">
        <button
          onClick={() => setActiveTab('vulnerabilities')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'vulnerabilities'
              ? 'text-horns-blue border-b-2 border-horns-blue'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Vulnerabilities ({vulnerabilities.length})
        </button>
        <button
          onClick={() => setActiveTab('intel')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'intel'
              ? 'text-horns-blue border-b-2 border-horns-blue'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Threat Intel ({threats.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-horns-gray border border-horns-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-horns-blue"
        />
      </div>

      {/* Vulnerabilities Tab */}
      {activeTab === 'vulnerabilities' && (
        <div className="space-y-4">
          {filteredVulnerabilities.map((vuln) => (
            <div key={vuln.cve_id} className="bg-horns-gray rounded-lg p-6 border border-horns-light hover:border-horns-blue transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <SeverityBadge severity={vuln.severity} />
                  <span className="font-mono text-lg font-bold text-white">{vuln.cve_id}</span>
                  <span className="px-3 py-1 text-sm rounded-full bg-horns-dark text-gray-300">
                    CVSS {vuln.cvss_score}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {vuln.patched && (
                    <span className="px-3 py-1 text-sm rounded-full bg-green-500/10 text-green-400">
                      Patched
                    </span>
                  )}
                  {!vuln.patched && vuln.patch_available && (
                    <span className="px-3 py-1 text-sm rounded-full bg-yellow-500/10 text-yellow-400">
                      Patch Available
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-white font-medium mb-2">{vuln.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{vuln.description}</p>
              <div>
                <p className="text-xs text-gray-500 mb-2">Affected Systems ({vuln.affected_systems.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {vuln.affected_systems.map((system) => (
                    <span key={system} className="px-2 py-1 text-xs rounded bg-horns-dark text-gray-300">
                      {system}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Threat Intel Tab */}
      {activeTab === 'intel' && (
        <div className="bg-horns-gray rounded-lg border border-horns-light overflow-hidden">
          <table className="w-full">
            <thead className="bg-horns-dark border-b border-horns-light">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Indicator</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Confidence</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-horns-light">
              {filteredThreats.map((threat) => (
                <tr key={threat.id} className="hover:bg-horns-dark transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-horns-dark text-gray-300 capitalize">
                      {threat.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-white">{threat.indicator}</td>
                  <td className="px-6 py-4 text-sm text-gray-400 max-w-md truncate">{threat.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs rounded-full capitalize ${
                      threat.confidence === 'high' ? 'bg-red-500/10 text-red-400' :
                      threat.confidence === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {threat.confidence}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {threat.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded bg-horns-dark text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

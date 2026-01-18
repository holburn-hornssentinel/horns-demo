'use client'

import { useEffect, useState } from 'react'
import SeverityBadge from '@/components/SeverityBadge'
import { useToast } from '@/components/Toast'
import { Shield, Search, CheckCircle, Ban, AlertTriangle } from 'lucide-react'

import { getApiUrl } from '@/lib/api'

const API_URL = getApiUrl()

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
  const [selectedThreat, setSelectedThreat] = useState<ThreatIntel | null>(null)
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null)

  // Filter states
  const [severityFilter, setSeverityFilter] = useState<string | null>(null)
  const [patchFilter, setPatchFilter] = useState<boolean | null>(null)
  const [confidenceFilter, setConfidenceFilter] = useState<string | null>(null)
  const [systemFilter, setSystemFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  const toast = useToast()

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

  const filteredVulnerabilities = vulnerabilities.filter(v => {
    // Search filter
    const matchesSearch = v.cve_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase())

    // Severity filter
    const matchesSeverity = !severityFilter || v.severity === severityFilter

    // Patch filter
    const matchesPatch = patchFilter === null || v.patched === patchFilter

    // System filter
    const matchesSystem = !systemFilter || v.affected_systems.includes(systemFilter)

    return matchesSearch && matchesSeverity && matchesPatch && matchesSystem
  })

  const filteredThreats = threats.filter(t => {
    // Search filter
    const matchesSearch = t.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Confidence filter
    const matchesConfidence = !confidenceFilter || t.confidence === confidenceFilter

    // Tag filter
    const matchesTag = !tagFilter || t.tags.includes(tagFilter)

    return matchesSearch && matchesConfidence && matchesTag
  })

  // Filter handlers
  const handleCriticalCVEsClick = () => {
    setActiveTab('vulnerabilities')
    setSeverityFilter('critical')
    setPatchFilter(null)
    setSystemFilter(null)
  }

  const handleUnpatchedClick = () => {
    setActiveTab('vulnerabilities')
    setSeverityFilter(null)
    setPatchFilter(false)
    setSystemFilter(null)
  }

  const handleThreatIOCsClick = () => {
    setActiveTab('intel')
    setConfidenceFilter(null)
    setTagFilter(null)
  }

  const handleHighConfidenceClick = () => {
    setActiveTab('intel')
    setConfidenceFilter('high')
    setTagFilter(null)
  }

  const handleSystemClick = (system: string) => {
    setSystemFilter(system)
  }

  const handleTagClick = (tag: string) => {
    setTagFilter(tag)
  }

  const clearAllFilters = () => {
    setSeverityFilter(null)
    setPatchFilter(null)
    setConfidenceFilter(null)
    setSystemFilter(null)
    setTagFilter(null)
  }

  // Action handlers
  const handleMarkPatched = async (cveId: string) => {
    // Optimistic update
    setVulnerabilities(prev => prev.map(v =>
      v.cve_id === cveId ? { ...v, patched: true } : v
    ))

    toast.success(`${cveId} marked as patched`)

    try {
      await fetch(`${API_URL}/api/vulnerabilities/${cveId}/patch`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to mark as patched:', error)
    }
  }

  const handleBlockIOC = async (iocId: string, indicator: string) => {
    toast.success(`Blocking ${indicator}...`)

    try {
      const response = await fetch(`${API_URL}/api/threats/ioc/${iocId}/block`, { method: 'POST' })
      const data = await response.json()
      toast.info(data.message)
    } catch (error) {
      console.error('Failed to block IOC:', error)
      toast.error('Failed to block indicator')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Shield className="w-12 h-12 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-card-foreground mb-2">Threat Intelligence</h1>
        <p className="text-muted-foreground">CVE tracking and threat indicators</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={handleCriticalCVEsClick}
          className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 cursor-pointer hover:border-red-500/40 hover:bg-red-500/10 transition-all"
        >
          <p className="text-2xl font-bold text-red-400">
            {vulnerabilities.filter(v => v.severity === 'critical').length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Critical CVEs</p>
        </div>
        <div
          onClick={handleUnpatchedClick}
          className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 cursor-pointer hover:border-yellow-500/40 hover:bg-yellow-500/10 transition-all"
        >
          <p className="text-2xl font-bold text-yellow-400">
            {vulnerabilities.filter(v => !v.patched).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Unpatched</p>
        </div>
        <div
          onClick={handleThreatIOCsClick}
          className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/10 transition-all"
        >
          <p className="text-2xl font-bold text-blue-400">{threats.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Threat IOCs</p>
        </div>
        <div
          onClick={handleHighConfidenceClick}
          className="p-4 rounded-lg border border-green-500/20 bg-green-500/5 cursor-pointer hover:border-green-500/40 hover:bg-green-500/10 transition-all"
        >
          <p className="text-2xl font-bold text-green-400">
            {threats.filter(t => t.confidence === 'high').length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">High Confidence</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-border">
        <button
          onClick={() => setActiveTab('vulnerabilities')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'vulnerabilities'
              ? 'text-primary border-b-2 border-horns-blue'
              : 'text-muted-foreground hover:text-card-foreground'
          }`}
        >
          Vulnerabilities ({vulnerabilities.length})
        </button>
        <button
          onClick={() => setActiveTab('intel')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'intel'
              ? 'text-primary border-b-2 border-horns-blue'
              : 'text-muted-foreground hover:text-card-foreground'
          }`}
        >
          Threat Intel ({threats.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-card-foreground placeholder-gray-500 focus:outline-none focus:border-horns-blue"
        />
      </div>

      {/* Active Filters */}
      {(severityFilter || patchFilter !== null || systemFilter || confidenceFilter || tagFilter) && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-secondary rounded-lg border border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {severityFilter && (
            <span className="px-3 py-1 text-sm rounded-full bg-card border border-border text-card-foreground flex items-center gap-2">
              Severity: {severityFilter}
              <button onClick={() => setSeverityFilter(null)} className="hover:text-red-400">✕</button>
            </span>
          )}
          {patchFilter !== null && (
            <span className="px-3 py-1 text-sm rounded-full bg-card border border-border text-card-foreground flex items-center gap-2">
              {patchFilter ? 'Patched' : 'Unpatched'}
              <button onClick={() => setPatchFilter(null)} className="hover:text-red-400">✕</button>
            </span>
          )}
          {systemFilter && (
            <span className="px-3 py-1 text-sm rounded-full bg-card border border-border text-card-foreground flex items-center gap-2">
              System: {systemFilter}
              <button onClick={() => setSystemFilter(null)} className="hover:text-red-400">✕</button>
            </span>
          )}
          {confidenceFilter && (
            <span className="px-3 py-1 text-sm rounded-full bg-card border border-border text-card-foreground flex items-center gap-2">
              Confidence: {confidenceFilter}
              <button onClick={() => setConfidenceFilter(null)} className="hover:text-red-400">✕</button>
            </span>
          )}
          {tagFilter && (
            <span className="px-3 py-1 text-sm rounded-full bg-card border border-border text-card-foreground flex items-center gap-2">
              Tag: {tagFilter}
              <button onClick={() => setTagFilter(null)} className="hover:text-red-400">✕</button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="ml-auto px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Vulnerabilities Tab */}
      {activeTab === 'vulnerabilities' && (
        <div className="space-y-4">
          {filteredVulnerabilities.map((vuln) => (
            <div key={vuln.cve_id} onClick={() => setSelectedVuln(vuln)} className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <SeverityBadge severity={vuln.severity} />
                  <span className="font-mono text-lg font-bold text-card-foreground">{vuln.cve_id}</span>
                  <span className="px-3 py-1 text-sm rounded-full bg-secondary text-foreground">
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
              <h3 className="text-card-foreground font-medium mb-2">{vuln.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{vuln.description}</p>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Affected Systems ({vuln.affected_systems.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {vuln.affected_systems.map((system) => (
                    <span
                      key={system}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSystemClick(system)
                      }}
                      className={`px-2 py-1 text-xs rounded cursor-pointer transition-all ${
                        systemFilter === system
                          ? 'bg-horns-blue text-white border border-horns-blue'
                          : 'bg-secondary text-foreground hover:bg-horns-blue/20 hover:border-horns-blue/50 border border-transparent'
                      }`}
                    >
                      {system}
                    </span>
                  ))}
                </div>
                {!vuln.patched && (
                  <p className="text-xs text-yellow-400 mt-2">
                    Click to view remediation steps →
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Threat Intel Tab */}
      {activeTab === 'intel' && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Indicator</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Confidence</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Tags</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-horns-light">
              {filteredThreats.map((threat) => (
                <tr key={threat.id} onClick={() => setSelectedThreat(threat)} className="hover:bg-secondary transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-secondary text-foreground capitalize">
                      {threat.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-card-foreground">{threat.indicator}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-md truncate">{threat.description}</td>
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
                        <span
                          key={tag}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTagClick(tag)
                          }}
                          className={`px-2 py-0.5 text-xs rounded cursor-pointer transition-all ${
                            tagFilter === tag
                              ? 'bg-horns-blue text-white'
                              : 'bg-secondary text-muted-foreground hover:bg-horns-blue/20'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBlockIOC(threat.id, threat.indicator)
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Block
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Threat IOC Detail Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedThreat(null)}>
          <div className="bg-card rounded-lg max-w-2xl w-full border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 text-sm rounded-full bg-secondary text-foreground capitalize">
                      {selectedThreat.type}
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full capitalize ${
                      selectedThreat.confidence === 'high' ? 'bg-red-500/10 text-red-400' :
                      selectedThreat.confidence === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {selectedThreat.confidence} confidence
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground font-mono">{selectedThreat.indicator}</h2>
                </div>
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="text-muted-foreground hover:text-card-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-card-foreground">{selectedThreat.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">First Seen</h3>
                  <p className="text-card-foreground">{selectedThreat.first_seen}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Seen</h3>
                  <p className="text-card-foreground">{selectedThreat.last_seen}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Indicator Type</h3>
                  <p className="text-card-foreground uppercase">{selectedThreat.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Threat ID</h3>
                  <p className="text-card-foreground font-mono text-sm">{selectedThreat.id}</p>
                </div>
              </div>
              {selectedThreat.tags && selectedThreat.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedThreat.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => {
                          handleTagClick(tag)
                          setSelectedThreat(null)
                        }}
                        className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-all ${
                          tagFilter === tag
                            ? 'bg-horns-blue text-white'
                            : 'bg-secondary text-foreground hover:bg-horns-blue/20'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    handleBlockIOC(selectedThreat.id, selectedThreat.indicator)
                    setSelectedThreat(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  Block This Indicator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vulnerability Detail Modal */}
      {selectedVuln && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedVuln(null)}>
          <div className="bg-card rounded-lg max-w-3xl w-full border border-border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <SeverityBadge severity={selectedVuln.severity} />
                    <span className="px-3 py-1 text-sm rounded-full bg-secondary text-foreground">
                      CVSS {selectedVuln.cvss_score}
                    </span>
                    {selectedVuln.patched ? (
                      <span className="px-3 py-1 text-sm rounded-full bg-green-500/10 text-green-400">
                        Patched
                      </span>
                    ) : selectedVuln.patch_available ? (
                      <span className="px-3 py-1 text-sm rounded-full bg-yellow-500/10 text-yellow-400">
                        Patch Available
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-sm rounded-full bg-red-500/10 text-red-400">
                        No Patch
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground font-mono">{selectedVuln.cve_id}</h2>
                  <p className="text-lg text-muted-foreground mt-1">{selectedVuln.title}</p>
                </div>
                <button
                  onClick={() => setSelectedVuln(null)}
                  className="text-muted-foreground hover:text-card-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-card-foreground">{selectedVuln.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Affected Systems ({selectedVuln.affected_systems.length})</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedVuln.affected_systems.map((system) => (
                    <div
                      key={system}
                      onClick={() => {
                        handleSystemClick(system)
                        setSelectedVuln(null)
                      }}
                      className={`px-3 py-2 rounded cursor-pointer transition-all ${
                        systemFilter === system
                          ? 'bg-horns-blue text-white border border-horns-blue'
                          : 'bg-secondary text-foreground border border-border hover:border-horns-blue/50 hover:bg-horns-blue/10'
                      }`}
                    >
                      {system}
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation Steps */}
              {!selectedVuln.patched && selectedVuln.patch_available && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-yellow-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Remediation Steps
                  </h3>
                  <ol className="space-y-3 text-sm text-card-foreground list-decimal list-inside">
                    <li><strong>Backup Configuration:</strong> Before patching, backup current Exchange server configuration and databases</li>
                    <li><strong>Download Patch:</strong> Obtain latest security update from Microsoft Security Update Guide</li>
                    <li><strong>Test in Staging:</strong> Deploy patch to staging environment first to validate compatibility</li>
                    <li><strong>Schedule Maintenance:</strong> Plan patching during off-peak hours to minimize user impact</li>
                    <li><strong>Apply Patch:</strong> Deploy security update to affected systems: {selectedVuln.affected_systems.join(', ')}</li>
                    <li><strong>Verify Deployment:</strong> Confirm patch installation and service functionality</li>
                    <li><strong>Monitor Systems:</strong> Watch for 24-48 hours for any anomalies or performance issues</li>
                  </ol>
                  <div className="mt-4 p-3 bg-secondary rounded text-xs">
                    <p className="text-muted-foreground"><strong>Estimated Time:</strong> 4-6 hours per server (including testing)</p>
                    <p className="text-muted-foreground mt-1"><strong>Risk Level:</strong> Medium - requires service restart</p>
                  </div>
                </div>
              )}

              {!selectedVuln.patched && !selectedVuln.patch_available && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-red-400 mb-3">No Patch Available</h3>
                  <p className="text-sm text-card-foreground mb-3">
                    No official patch has been released yet. Implement compensating controls:
                  </p>
                  <ul className="space-y-2 text-sm text-card-foreground list-disc list-inside">
                    <li>Enable additional network segmentation for affected systems</li>
                    <li>Implement enhanced monitoring and alerting</li>
                    <li>Apply firewall rules to restrict access</li>
                    <li>Disable vulnerable features if possible</li>
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Published Date</h3>
                  <p className="text-card-foreground">{selectedVuln.published_date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">CVE ID</h3>
                  <p className="text-card-foreground font-mono text-sm">{selectedVuln.cve_id}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {!selectedVuln.patched && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      handleMarkPatched(selectedVuln.cve_id)
                      setSelectedVuln({ ...selectedVuln, patched: true })
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Patched
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Creating patching task for affected systems...')
                      setTimeout(() => {
                        toast.success(`Patching task created for ${selectedVuln.affected_systems.length} systems`)
                      }, 1500)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Schedule Patch Deployment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

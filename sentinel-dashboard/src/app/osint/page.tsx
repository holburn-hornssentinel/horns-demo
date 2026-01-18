'use client'

import { useEffect, useState } from 'react'
import SeverityBadge from '@/components/SeverityBadge'
import { useToast } from '@/components/Toast'
import { Eye, Search, ExternalLink, CheckCircle, AlertCircle, User, Building2, Globe, Mail, Phone, Hash, ChevronRight, Sparkles, TrendingUp, MapPin, Users, Shield, Download, Save, X, Calendar, Tag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { getApiUrl } from '@/lib/api'

const API_URL = getApiUrl()

interface OSINTFinding {
  id: string
  type: string
  source: string
  finding: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  discovered_at: string
  verified: boolean
}

interface SearchResult {
  id: string
  source: string
  confidence: number
  ai_enhanced: boolean
  title: string
  description: string
  url: string | null
  entities: string[]
  metadata: Record<string, any>
}

const searchTypes = [
  { id: 'person', name: 'Person', icon: User, description: 'Find individuals' },
  { id: 'company', name: 'Company', icon: Building2, description: 'Research organizations' },
  { id: 'domain', name: 'Domain', icon: Globe, description: 'Analyze websites' },
  { id: 'email', name: 'Email', icon: Mail, description: 'Email intelligence' },
  { id: 'phone', name: 'Phone', icon: Phone, description: 'Phone lookup' },
  { id: 'username', name: 'Username', icon: Hash, description: 'Cross-platform search' },
]

const dataSources = [
  { id: 'web', name: 'Web Search', description: 'Tavily AI + Jina Reader' },
  { id: 'social', name: 'Social Media', description: 'LinkedIn, Facebook, Twitter' },
  { id: 'legal', name: 'Legal Records', description: 'Court cases, litigation' },
  { id: 'news', name: 'News & Media', description: 'Articles, press releases' },
  { id: 'darkweb', name: 'Dark Web', description: 'Premium, breach data & forums' },
  { id: 'spiderfoot', name: 'SpiderFoot Modules', description: '200+ OSINT modules' },
]

export default function OSINTPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'findings' | 'insights'>('search')
  const [findings, setFindings] = useState<OSINTFinding[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const toast = useToast()

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1)
  const [selectedSearchType, setSelectedSearchType] = useState('person')
  const [searchDetails, setSearchDetails] = useState({ firstName: 'John', lastName: 'Smith', location: '', keywords: 'Acme Corporation' })
  const [selectedSources, setSelectedSources] = useState<string[]>(['web', 'social', 'darkweb', 'spiderfoot'])
  const [searchDepth, setSearchDepth] = useState('balanced')
  const [showResults, setShowResults] = useState(false)

  // Modal state
  const [selectedFinding, setSelectedFinding] = useState<OSINTFinding | null>(null)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  // Filter state for search results
  const [resultFilter, setResultFilter] = useState<'all' | 'ai_enhanced' | 'verified'>('all')

  useEffect(() => {
    async function fetchFindings() {
      try {
        const response = await fetch(`${API_URL}/api/osint`)
        const data = await response.json()
        setFindings(data)
      } catch (error) {
        console.error('Failed to fetch OSINT findings:', error)
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

  const stats = {
    total: findings.length,
    verified: findings.filter(f => f.verified).length,
    credential_leaks: findings.filter(f => f.type === 'credential_leak').length,
    dark_web: findings.filter(f => f.type === 'dark_web_mention').length,
  }

  const handleRunSearch = async () => {
    setLoading(true)
    try {
      // Simulate API call - in real implementation, would hit /api/osint/search
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Load demo search results
      const response = await fetch(`${API_URL}/api/osint/search-results`)
      const data = await response.json()
      setSearchResults(data.results || [])
      setShowResults(true)
    } catch (error) {
      console.error('Search failed:', error)
      // Fallback to demo data
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    )
  }

  const handleExportFindings = async (format: 'csv' | 'pdf' = 'csv') => {
    toast.info(`Exporting ${filteredFindings.length} findings as ${format.toUpperCase()}...`)

    try {
      const response = await fetch(`${API_URL}/api/osint/export?format=${format}`, { method: 'POST' })
      const data = await response.json()
      toast.success(data.message)
    } catch (error) {
      console.error('Failed to export:', error)
      toast.error('Export failed')
    }
  }

  const handleSaveFinding = async (findingId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }
    toast.success('Finding saved to investigation workspace')

    try {
      await fetch(`${API_URL}/api/osint/findings/${findingId}/save`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to save finding:', error)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.url) {
      window.open(result.url, '_blank', 'noopener,noreferrer')
    } else {
      setSelectedResult(result)
    }
  }

  const handleFindingClick = (finding: OSINTFinding) => {
    setSelectedFinding(finding)
  }

  const handleStatBoxClick = (filterType: 'all' | 'ai_enhanced' | 'verified') => {
    setResultFilter(filterType)
  }

  // Filter search results based on active filter
  const filteredSearchResults = searchResults.filter(result => {
    if (resultFilter === 'all') return true
    if (resultFilter === 'ai_enhanced') return result.ai_enhanced
    if (resultFilter === 'verified') return result.confidence >= 85
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-card-foreground mb-2">OSINT Platform</h1>
        <p className="text-muted-foreground">Open-source intelligence gathering and analysis</p>
      </div>

      {/* Finding Detail Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFinding(null)}>
          <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">Finding Details</h2>
                <p className="text-muted-foreground text-sm mt-1">OSINT Finding ID: {selectedFinding.id}</p>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <SeverityBadge severity={selectedFinding.severity} size="md" />
                <span className="px-3 py-1 text-sm rounded-full bg-secondary text-foreground capitalize">
                  {selectedFinding.type.replace(/_/g, ' ')}
                </span>
                {selectedFinding.verified ? (
                  <span className="flex items-center space-x-1 text-green-400 text-sm px-3 py-1 rounded-full bg-green-500/10">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-yellow-400 text-sm px-3 py-1 rounded-full bg-yellow-500/10">
                    <AlertCircle className="w-4 h-4" />
                    <span>Unverified</span>
                  </span>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Timeline</span>
                </div>
                <p className="text-card-foreground">
                  Discovered {formatDistanceToNow(new Date(selectedFinding.discovered_at), { addSuffix: true })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(selectedFinding.discovered_at).toLocaleString()}
                </p>
              </div>

              {/* Source */}
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">Source</span>
                </div>
                <p className="text-card-foreground font-mono">{selectedFinding.source}</p>
              </div>

              {/* Finding Content */}
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-medium">Finding</span>
                </div>
                <p className="text-card-foreground font-mono text-sm whitespace-pre-wrap">
                  {selectedFinding.finding}
                </p>
              </div>

              {/* Remediation Suggestions */}
              {selectedFinding.type === 'credential_leak' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-red-400 mb-3">Remediation Steps</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start space-x-2">
                      <span className="text-red-400 mt-1">1.</span>
                      <span>Immediately reset all passwords associated with the exposed credentials</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-400 mt-1">2.</span>
                      <span>Enable multi-factor authentication (MFA) on all affected accounts</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-400 mt-1">3.</span>
                      <span>Review recent account activity for suspicious logins or actions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-400 mt-1">4.</span>
                      <span>Notify affected users and security team immediately</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-400 mt-1">5.</span>
                      <span>Monitor for further credential exposure or account compromise</span>
                    </li>
                  </ul>
                </div>
              )}

              {selectedFinding.type === 'dark_web_mention' && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-400 mb-3">Recommended Actions</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 mt-1">1.</span>
                      <span>Continue monitoring dark web forums for additional mentions or escalation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 mt-1">2.</span>
                      <span>Review security posture of systems mentioned in the post</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 mt-1">3.</span>
                      <span>Increase logging and monitoring for targeted systems</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 mt-1">4.</span>
                      <span>Alert incident response team of potential threat actor interest</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 mt-1">5.</span>
                      <span>Consider threat hunting activities in mentioned environments</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button
                  onClick={() => setSelectedFinding(null)}
                  className="px-4 py-2 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={(e) => {
                    handleSaveFinding(selectedFinding.id, e)
                    setSelectedFinding(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save to Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Result Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedResult(null)}>
          <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">{selectedResult.title}</h2>
                <p className="text-muted-foreground text-sm mt-1">{selectedResult.source}</p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Confidence & Enhancement */}
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <span className="px-3 py-1 text-sm rounded-full bg-green-500/20 text-green-400">
                  {selectedResult.confidence}% Confidence
                </span>
                {selectedResult.ai_enhanced && (
                  <span className="px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-400 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Enhanced</span>
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="font-semibold text-card-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedResult.description}</p>
              </div>

              {/* Entities */}
              {selectedResult.entities.length > 0 && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="font-semibold text-card-foreground mb-3">Extracted Entities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.entities.map((entity, index) => (
                      <span key={index} className="px-3 py-1 text-sm rounded-full bg-secondary text-foreground">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {Object.keys(selectedResult.metadata).length > 0 && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="font-semibold text-card-foreground mb-3">Additional Metadata</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedResult.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-card-foreground font-mono">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button
                  onClick={() => setSelectedResult(null)}
                  className="px-4 py-2 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Close
                </button>
                {selectedResult.url && (
                  <button
                    onClick={() => window.open(selectedResult.url!, '_blank', 'noopener,noreferrer')}
                    className="flex items-center gap-2 px-4 py-2 bg-horns-blue text-white rounded-lg hover:bg-horns-blue/90 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Source
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-8">
          <button
            onClick={() => { setActiveTab('search'); setShowResults(false); setWizardStep(1); }}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-horns-blue text-horns-blue'
                : 'border-transparent text-muted-foreground hover:text-card-foreground'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span className="font-medium">Search</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('findings')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'findings'
                ? 'border-horns-blue text-horns-blue'
                : 'border-transparent text-muted-foreground hover:text-card-foreground'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span className="font-medium">Findings ({findings.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'insights'
                ? 'border-horns-blue text-horns-blue'
                : 'border-transparent text-muted-foreground hover:text-card-foreground'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI Insights</span>
            </div>
          </button>
        </div>
      </div>

      {/* Search Tab - Wizard */}
      {activeTab === 'search' && !showResults && (
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    wizardStep >= step
                      ? 'bg-horns-blue text-white'
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  {step < 5 && (
                    <div className={`h-1 w-16 mx-2 ${
                      wizardStep > step ? 'bg-horns-blue' : 'bg-secondary'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Type</span>
              <span>Details</span>
              <span>Sources</span>
              <span>Quality</span>
              <span>Review</span>
            </div>
          </div>

          {/* Step 1: Search Type */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select Search Type</h2>
                <p className="text-muted-foreground">What would you like to search for?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedSearchType(type.id)}
                    className={`p-6 rounded-lg border-2 text-left transition-all ${
                      selectedSearchType === type.id
                        ? 'border-horns-blue bg-horns-blue/10'
                        : 'border-border bg-card hover:border-horns-blue/50'
                    }`}
                  >
                    <type.icon className={`w-8 h-8 mb-3 ${
                      selectedSearchType === type.id ? 'text-horns-blue' : 'text-muted-foreground'
                    }`} />
                    <h3 className="font-semibold text-card-foreground mb-1">{type.name}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setWizardStep(2)}
                className="w-full py-3 bg-horns-blue text-white rounded-lg hover:bg-horns-blue/90 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Enter Search Details</h2>
                <p className="text-muted-foreground">Provide information about your search target</p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    value={searchDetails.firstName}
                    onChange={(e) => setSearchDetails({ ...searchDetails, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-horns-blue"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={searchDetails.lastName}
                    onChange={(e) => setSearchDetails({ ...searchDetails, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-horns-blue"
                    placeholder="Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location (Optional)</label>
                  <input
                    type="text"
                    value={searchDetails.location}
                    onChange={(e) => setSearchDetails({ ...searchDetails, location: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-horns-blue"
                    placeholder="Boston, MA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Related Keywords (Optional)</label>
                  <input
                    type="text"
                    value={searchDetails.keywords}
                    onChange={(e) => setSearchDetails({ ...searchDetails, keywords: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-horns-blue"
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setWizardStep(1)}
                  className="flex-1 py-3 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  className="flex-1 py-3 bg-horns-blue text-white rounded-lg hover:bg-horns-blue/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Data Sources */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select Data Sources</h2>
                <p className="text-muted-foreground">Choose which sources to search</p>
              </div>

              <div className="space-y-3">
                {dataSources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                      selectedSources.includes(source.id)
                        ? 'border-horns-blue bg-horns-blue/10'
                        : 'border-border bg-card hover:border-horns-blue/50'
                    }`}
                  >
                    <div>
                      <h3 className="font-semibold text-card-foreground">{source.name}</h3>
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      selectedSources.includes(source.id)
                        ? 'border-horns-blue bg-horns-blue'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedSources.includes(source.id) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setWizardStep(2)}
                  className="flex-1 py-3 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardStep(4)}
                  className="flex-1 py-3 bg-horns-blue text-white rounded-lg hover:bg-horns-blue/90 transition-colors flex items-center justify-center space-x-2"
                  disabled={selectedSources.length === 0}
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Search Quality */}
          {wizardStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Search Quality</h2>
                <p className="text-muted-foreground">Configure search depth and timeframe</p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Search Depth</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['fast', 'balanced', 'deep'].map((depth) => (
                      <button
                        key={depth}
                        onClick={() => setSearchDepth(depth)}
                        className={`p-4 rounded-lg border-2 capitalize ${
                          searchDepth === depth
                            ? 'border-horns-blue bg-horns-blue/10 text-horns-blue'
                            : 'border-border bg-secondary text-card-foreground hover:border-horns-blue/50'
                        }`}
                      >
                        {depth}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setWizardStep(3)}
                  className="flex-1 py-3 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardStep(5)}
                  className="flex-1 py-3 bg-horns-blue text-white rounded-lg hover:bg-horns-blue/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Launch */}
          {wizardStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review & Launch Search</h2>
                <p className="text-muted-foreground">Confirm your search parameters</p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Search Type</p>
                    <p className="font-semibold capitalize">{selectedSearchType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="font-semibold">{searchDetails.firstName} {searchDetails.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Keywords</p>
                    <p className="font-semibold">{searchDetails.keywords || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sources</p>
                    <p className="font-semibold">{selectedSources.length} selected</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Search Depth</p>
                    <p className="font-semibold capitalize">{searchDepth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Credits</p>
                    <p className="font-semibold text-horns-blue">15 credits</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Remaining Balance</span>
                    <span className="text-2xl font-bold text-green-400">873 credits</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setWizardStep(4)}
                  className="flex-1 py-3 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleRunSearch}
                  disabled={loading}
                  className="flex-1 py-3 bg-horns-blue text-white rounded-lg hover:bg-horns-blue/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Start Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {activeTab === 'search' && showResults && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Search Results</h2>
              <p className="text-muted-foreground">Found 42 results for John Smith at Acme Corporation</p>
            </div>
            <button
              onClick={() => { setShowResults(false); setWizardStep(1); }}
              className="px-4 py-2 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80"
            >
              New Search
            </button>
          </div>

          {/* Stats - Clickable Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleStatBoxClick('all')}
              className={`p-4 rounded-lg border transition-all text-left ${
                resultFilter === 'all'
                  ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50'
                  : 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer'
              }`}
            >
              <p className="text-2xl font-bold text-blue-400">42</p>
              <p className="text-sm text-muted-foreground mt-1">Total Results</p>
              {resultFilter === 'all' && (
                <p className="text-xs text-blue-400 mt-1">Active Filter</p>
              )}
            </button>
            <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
              <p className="text-2xl font-bold text-green-400">5</p>
              <p className="text-sm text-muted-foreground mt-1">Sources</p>
            </div>
            <button
              onClick={() => handleStatBoxClick('ai_enhanced')}
              className={`p-4 rounded-lg border transition-all text-left ${
                resultFilter === 'ai_enhanced'
                  ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/50'
                  : 'border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer'
              }`}
            >
              <p className="text-2xl font-bold text-purple-400">35</p>
              <p className="text-sm text-muted-foreground mt-1">AI Enhanced</p>
              {resultFilter === 'ai_enhanced' && (
                <p className="text-xs text-purple-400 mt-1">Active Filter</p>
              )}
            </button>
            <button
              onClick={() => handleStatBoxClick('verified')}
              className={`p-4 rounded-lg border transition-all text-left ${
                resultFilter === 'verified'
                  ? 'border-orange-500 bg-orange-500/20 ring-2 ring-orange-500/50'
                  : 'border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 cursor-pointer'
              }`}
            >
              <p className="text-2xl font-bold text-orange-400">127</p>
              <p className="text-sm text-muted-foreground mt-1">High Confidence (85%+)</p>
              {resultFilter === 'verified' && (
                <p className="text-xs text-orange-400 mt-1">Active Filter</p>
              )}
            </button>
          </div>

          {/* Demo Results */}
          <div className="space-y-4">
            {/* LinkedIn Result */}
            <div
              onClick={() => handleResultClick({
                id: '1',
                source: 'LinkedIn',
                confidence: 85,
                ai_enhanced: true,
                title: 'John Smith - Senior Software Engineer',
                description: 'Senior Software Engineer at Acme Corporation with 10+ years of experience in cloud security and DevOps. Based in Boston, MA.',
                url: 'https://linkedin.com/in/john-smith',
                entities: ['Person', 'Organization'],
                metadata: { location: 'Boston, MA', company: 'Acme Corporation', experience: '10+ years' }
              })}
              className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
                    in
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground group-hover:text-horns-blue transition-colors">John Smith - Senior Software Engineer</h3>
                    <p className="text-sm text-muted-foreground">LinkedIn</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400">85% Confidence</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Enhanced</span>
                  </span>
                </div>
              </div>
              <p className="text-card-foreground mb-3">
                Senior Software Engineer at Acme Corporation with 10+ years of experience in cloud security and DevOps. Based in Boston, MA.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs rounded bg-secondary text-foreground">Person</span>
                  <span className="px-2 py-1 text-xs rounded bg-secondary text-foreground">Organization</span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-horns-blue transition-colors" />
              </div>
            </div>

            {/* Dark Web - Credential Leak */}
            <div
              onClick={() => handleResultClick({
                id: '2',
                source: 'Dark Web',
                confidence: 91,
                ai_enhanced: true,
                title: 'Credential Exposure - Stealer Log',
                description: 'Email address jsmith@acme.com found in stealer malware log dump. Password hash and session tokens exposed.',
                url: null,
                entities: ['Email', 'Credentials'],
                metadata: { email: 'jsmith@acme.com', exposure_type: 'Stealer Log', severity: 'CRITICAL' }
              })}
              className="bg-card rounded-lg p-6 border-2 border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-10 h-10 text-red-400" />
                  <div>
                    <h3 className="font-semibold text-card-foreground group-hover:text-red-400 transition-colors">Credential Exposure - Stealer Log</h3>
                    <p className="text-sm text-muted-foreground">Dark Web</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-400">91% Confidence</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Enhanced</span>
                  </span>
                </div>
              </div>
              <p className="text-card-foreground mb-3">
                Email address jsmith@acme.com found in stealer malware log dump. Password hash and session tokens exposed.
              </p>
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
                <p className="text-sm text-red-400">
                  <strong>CRITICAL:</strong> Immediately force password reset for jsmith@acme.com and enable MFA on all accounts.
                </p>
              </div>
            </div>

            {/* Threat Actor Post */}
            <div
              onClick={() => handleResultClick({
                id: '3',
                source: 'BreachForums',
                confidence: 88,
                ai_enhanced: true,
                title: 'Dark Web Mention - VPN Access Request',
                description: 'Threat actor post on BreachForums requesting VPN access to Acme Corporation network. Posted 3 days ago.',
                url: null,
                entities: ['Organization', 'Threat Actor'],
                metadata: { platform: 'BreachForums', posted: '3 days ago', target: 'Acme Corporation VPN' }
              })}
              className="bg-card rounded-lg p-6 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-10 h-10 text-purple-400" />
                  <div>
                    <h3 className="font-semibold text-card-foreground group-hover:text-purple-400 transition-colors">Dark Web Mention - VPN Access Request</h3>
                    <p className="text-sm text-muted-foreground">BreachForums</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400">88% Confidence</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Enhanced</span>
                  </span>
                </div>
              </div>
              <p className="text-card-foreground mb-3">
                Threat actor post on BreachForums requesting VPN access to Acme Corporation network. Posted 3 days ago.
              </p>
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded">
                <p className="text-sm text-purple-400">
                  <strong>ALERT:</strong> Active threat actor reconnaissance detected. Monitor VPN access attempts and review authentication logs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Findings Tab - Original Implementation */}
      {activeTab === 'findings' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Findings</p>
            </div>
            <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
              <p className="text-2xl font-bold text-green-400">{stats.verified}</p>
              <p className="text-sm text-muted-foreground mt-1">Verified</p>
            </div>
            <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
              <p className="text-2xl font-bold text-red-400">{stats.credential_leaks}</p>
              <p className="text-sm text-muted-foreground mt-1">Credential Leaks</p>
            </div>
            <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
              <p className="text-2xl font-bold text-purple-400">{stats.dark_web}</p>
              <p className="text-sm text-muted-foreground mt-1">Dark Web Mentions</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search findings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-card-foreground placeholder-gray-500 focus:outline-none focus:border-horns-blue"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-secondary border border-border rounded-lg text-card-foreground focus:outline-none focus:border-horns-blue"
              >
                <option value="all">All Types</option>
                {findingTypes.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => handleExportFindings('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExportFindings('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>

          {/* Findings List */}
          <div className="space-y-4">
            {filteredFindings.map((finding) => (
              <div
                key={finding.id}
                onClick={() => handleFindingClick(finding)}
                className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <SeverityBadge severity={finding.severity} size="sm" />
                    <span className="px-3 py-1 text-xs rounded-full bg-secondary text-foreground capitalize">
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
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(finding.discovered_at), { addSuffix: true })}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Source: {finding.source}</span>
                  </div>
                  <p className="text-card-foreground font-mono text-sm bg-secondary p-3 rounded group-hover:bg-secondary/80 transition-colors">
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

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-muted-foreground group-hover:text-horns-blue transition-colors">Click to view details</span>
                  <button
                    onClick={(e) => handleSaveFinding(finding.id, e)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save to Workspace
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredFindings.length === 0 && (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No OSINT findings match your filters</p>
            </div>
          )}
        </>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold">Claude-Powered Analysis</h2>
                <p className="text-muted-foreground">Intelligent insights from 42 OSINT results</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-background/50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-400">5</p>
                <p className="text-sm text-muted-foreground">Sources</p>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-400">28</p>
                <p className="text-sm text-muted-foreground">Domains</p>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-400">35</p>
                <p className="text-sm text-muted-foreground">AI Enhanced</p>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <p className="text-2xl font-bold text-orange-400">127</p>
                <p className="text-sm text-muted-foreground">Entities</p>
              </div>
            </div>

            <div className="bg-background/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-muted-foreground">
                Found 42 results for John Smith associated with Acme Corporation. High-confidence LinkedIn profile matches confirmed employment and location.
                <span className="text-red-400 font-semibold"> CRITICAL: Credentials exposed in recent malware dump.</span>
                <span className="text-purple-400 font-semibold"> ALERT: Active threat actor interest in Acme VPN access detected on BreachForums.</span>
              </p>
            </div>
          </div>

          {/* Patterns */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-horns-blue" />
              <span>Detected Patterns</span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-horns-blue mt-2" />
                <span className="text-muted-foreground">Strong professional presence on LinkedIn and Twitter with consistent biographical information</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2" />
                <span className="text-muted-foreground">Recent credential compromise detected in stealer malware dump (January 15, 2025)</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
                <span className="text-muted-foreground">Organization is target of threat actor reconnaissance on dark web forums</span>
              </li>
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Actionable Recommendations</span>
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 font-semibold mb-1">🔴 Immediate Action Required</p>
                <p className="text-sm text-muted-foreground">Force password reset for jsmith@acme.com across all systems</p>
              </div>
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-orange-400 font-semibold mb-1">🟠 High Priority</p>
                <p className="text-sm text-muted-foreground">Enable MFA on all accounts associated with exposed credentials</p>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 font-semibold mb-1">🟡 Monitor</p>
                <p className="text-sm text-muted-foreground">Review VPN access logs for suspicious authentication attempts</p>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 font-semibold mb-1">🔵 Inform</p>
                <p className="text-sm text-muted-foreground">Alert security team of active dark web threat actor interest</p>
              </div>
            </div>
          </div>

          {/* Entity Breakdown */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-horns-blue" />
              <span>Entity Breakdown</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <User className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">People</p>
              </div>
              <div className="text-center">
                <Building2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Organizations</p>
              </div>
              <div className="text-center">
                <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Locations</p>
              </div>
              <div className="text-center">
                <Mail className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Emails</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Credentials</p>
              </div>
            </div>
          </div>

          {/* Confidence Metrics */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="font-semibold mb-4">Confidence Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Source Reliability</span>
                  <span className="text-sm font-semibold">80%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '80%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Content Relevance</span>
                  <span className="text-sm font-semibold">85%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">AI Enhancement Quality</span>
                  <span className="text-sm font-semibold">90%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '90%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

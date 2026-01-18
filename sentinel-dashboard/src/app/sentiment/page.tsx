'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, MessageSquare, Twitter, Hash, ChevronRight, Sparkles, ThumbsUp, ThumbsDown, Minus, BarChart3, AlertTriangle } from 'lucide-react'

import { getApiUrl } from '@/lib/api'

const API_URL = getApiUrl()

interface Mention {
  id: string
  platform: string
  platform_icon: string
  name: string
  handle: string
  sentiment: 'positive' | 'neutral' | 'negative'
  sentiment_score: number
  content: string
  time: string
  engagement: string
  url: string
}

const intents = [
  { id: 'brand', name: 'Brand Monitor', description: 'Track your brand mentions', icon: TrendingUp },
  { id: 'competitor', name: 'Competitor Analysis', description: 'Compare against rivals', icon: BarChart3 },
  { id: 'crisis', name: 'Crisis Detection', description: 'Early warning system', icon: AlertTriangle },
]

const platforms = [
  { id: 'twitter', name: 'Twitter/X', icon: 'X', sources: 45 },
  { id: 'reddit', name: 'Reddit', icon: 'R', sources: 23 },
  { id: 'news', name: 'News Sites', icon: 'N', sources: 18 },
  { id: 'youtube', name: 'YouTube', icon: 'Y', sources: 12 },
  { id: 'linkedin', name: 'LinkedIn', icon: 'in', sources: 6 },
  { id: 'reviews', name: 'Reviews', icon: '★', sources: 4 },
]

export default function SentimentPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'dashboard' | 'mentions'>('dashboard')
  const [mentions, setMentions] = useState<Mention[]>([])
  const [loading, setLoading] = useState(true)
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all')
  const [platformFilter, setPlatformFilter] = useState<'all' | 'twitter' | 'reddit' | 'news' | 'reviews'>('all')
  const [selectedMention, setSelectedMention] = useState<Mention | null>(null)
  const [showSpikeModal, setShowSpikeModal] = useState(false)

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1)
  const [selectedIntent, setSelectedIntent] = useState('brand')
  const [searchTerms, setSearchTerms] = useState({ brandName: 'Acme Corporation', keywords: 'Acme, AcmeCorp', exclude: 'job posting, career' })
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'reddit', 'news', 'reviews'])
  const [timeRange, setTimeRange] = useState('30d')
  const [alertConfig, setAlertConfig] = useState({ negativeThreshold: 15, positiveThreshold: 75, delivery: ['email'] })
  const [showResults, setShowResults] = useState(true)

  // Load sentiment data on page load
  useEffect(() => {
    async function fetchSentimentData() {
      try {
        const response = await fetch(`${API_URL}/api/sentiment/mentions`)
        const data = await response.json()
        setMentions(data.mentions || [])
      } catch (error) {
        console.error('Failed to load sentiment data:', error)
        // Fall back to demo data if API fails
      } finally {
        setLoading(false)
      }
    }

    fetchSentimentData()
  }, [])

  const handleStartMonitoring = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Load demo mentions
      const response = await fetch(`${API_URL}/api/sentiment/mentions`)
      const data = await response.json()
      setMentions(data.mentions || [])
      setShowResults(true)
      setActiveTab('dashboard')
    } catch (error) {
      console.error('Monitoring failed:', error)
      setShowResults(true)
      setActiveTab('dashboard')
    } finally {
      setLoading(false)
    }
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const toggleDelivery = (method: string) => {
    setAlertConfig(prev => ({
      ...prev,
      delivery: prev.delivery.includes(method)
        ? prev.delivery.filter(m => m !== method)
        : [...prev.delivery, method]
    }))
  }

  // Demo data
  const demoMentions: Mention[] = [
    {
      id: '1',
      platform: 'twitter',
      platform_icon: 'X',
      name: 'Sarah Chen',
      handle: '@sarahchen_tech',
      sentiment: 'positive',
      sentiment_score: 85,
      content: 'Just tried <span class="highlight">Horns Sentinel</span> for our security team. The AI-powered threat detection is impressive! Finally, OSINT that doesn\'t require a PhD to use. 🔒✨',
      time: '2 hours ago',
      engagement: '342 likes • 45 retweets',
      url: 'https://twitter.com/sarahchen_tech/status/...'
    },
    {
      id: '2',
      platform: 'reddit',
      platform_icon: 'R',
      name: 'TechReviews',
      handle: 'u/TechReviews',
      sentiment: 'neutral',
      sentiment_score: 50,
      content: '<span class="highlight">Acme Corporation</span> announced new product features in their latest security platform update. Mixed reactions from enterprise customers.',
      time: '1 day ago',
      engagement: '89 upvotes • 23 comments',
      url: 'https://reddit.com/r/cybersecurity/comments/...'
    },
    {
      id: '3',
      platform: 'news',
      platform_icon: 'N',
      name: 'TechCrunch',
      handle: 'TechCrunch',
      sentiment: 'positive',
      sentiment_score: 78,
      content: '<span class="highlight">Acme Corporation</span> raises $15M Series A for AI-powered security monitoring platform. Investors bet on SMB market disruption.',
      time: '3 days ago',
      engagement: '1.2K views',
      url: 'https://techcrunch.com/2025/01/14/acme-corp-raises-15m'
    },
    {
      id: '4',
      platform: 'twitter',
      platform_icon: 'X',
      name: 'InfoSec Mike',
      handle: '@infosec_mike',
      sentiment: 'negative',
      sentiment_score: 25,
      content: 'Frustrated with <span class="highlight">Acme Corporation</span> product outage yesterday. Our monitoring was down for 3 hours during a critical incident. Not acceptable for security tools. 😤',
      time: '5 days ago',
      engagement: '156 likes • 67 retweets',
      url: 'https://twitter.com/infosec_mike/status/...'
    },
    {
      id: '5',
      platform: 'reviews',
      platform_icon: '★',
      name: 'Emily Rodriguez',
      handle: 'G2 Review',
      sentiment: 'positive',
      sentiment_score: 90,
      content: 'Game-changer for our security team. <span class="highlight">Acme</span>\'s OSINT platform found exposed credentials we had no idea about. ROI in the first month. Highly recommend! ⭐⭐⭐⭐⭐',
      time: '1 week ago',
      engagement: '14 helpful votes',
      url: 'https://g2.com/products/acme-sentinel/reviews'
    }
  ]

  const filteredMentions = (showResults ? demoMentions : mentions).filter(m => {
    const sentimentMatch = sentimentFilter === 'all' || m.sentiment === sentimentFilter
    const platformMatch = platformFilter === 'all' || m.platform === platformFilter
    return sentimentMatch && platformMatch
  })

  const sentimentStats = {
    total: 2847,
    positive: 1936,
    neutral: 683,
    negative: 228,
    positive_pct: 68,
    neutral_pct: 24,
    negative_pct: 8
  }

  const platformStats = [
    { name: 'Twitter/X', mentions: 1234, sentiment: 72 },
    { name: 'Reddit', mentions: 567, sentiment: 65 },
    { name: 'News Sites', mentions: 423, sentiment: 70 },
    { name: 'Reviews', mentions: 623, sentiment: 78 },
  ]

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'negative': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-3 h-3" />
      case 'negative': return <ThumbsDown className="w-3 h-3" />
      default: return <Minus className="w-3 h-3" />
    }
  }

  const handleSentimentCardClick = (sentiment: 'positive' | 'neutral' | 'negative') => {
    setSentimentFilter(sentiment)
    setActiveTab('mentions')
  }

  const handlePlatformCardClick = (platform: 'twitter' | 'reddit' | 'news' | 'reviews') => {
    setPlatformFilter(platform)
    setActiveTab('mentions')
  }

  const handleSpikeDetailsClick = () => {
    setSentimentFilter('negative')
    setPlatformFilter('all')
    setActiveTab('mentions')
  }

  const handleMentionCardClick = (mention: Mention) => {
    setSelectedMention(mention)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-card-foreground mb-2">Sentiment AI</h1>
        <p className="text-muted-foreground">Brand monitoring and sentiment analysis</p>
      </div>

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
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Setup</span>
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('dashboard'); setShowResults(true); }}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-horns-blue text-horns-blue'
                : 'border-transparent text-muted-foreground hover:text-card-foreground'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('mentions'); setShowResults(true); }}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'mentions'
                ? 'border-horns-blue text-horns-blue'
                : 'border-transparent text-muted-foreground hover:text-card-foreground'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Mentions ({filteredMentions.length})</span>
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
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    wizardStep >= step
                      ? 'bg-horns-blue text-white'
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  {step < 6 && (
                    <div className={`h-1 w-12 mx-2 ${
                      wizardStep > step ? 'bg-horns-blue' : 'bg-secondary'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Intent</span>
              <span>Terms</span>
              <span>Platforms</span>
              <span>Time</span>
              <span>Alerts</span>
              <span>Review</span>
            </div>
          </div>

          {/* Step 1: Intent Selection */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select Intent</h2>
                <p className="text-muted-foreground">What do you want to monitor?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {intents.map((intent) => (
                  <button
                    key={intent.id}
                    onClick={() => setSelectedIntent(intent.id)}
                    className={`p-6 rounded-lg border-2 text-left transition-all ${
                      selectedIntent === intent.id
                        ? 'border-horns-blue bg-horns-blue/10'
                        : 'border-border bg-card hover:border-horns-blue/50'
                    }`}
                  >
                    <intent.icon className={`w-8 h-8 mb-3 ${
                      selectedIntent === intent.id ? 'text-horns-blue' : 'text-muted-foreground'
                    }`} />
                    <h3 className="font-semibold text-card-foreground mb-1">{intent.name}</h3>
                    <p className="text-sm text-muted-foreground">{intent.description}</p>
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

          {/* Step 2: Search Terms */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Define Search Terms</h2>
                <p className="text-muted-foreground">What should we monitor?</p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Brand Name(s) *</label>
                  <input
                    type="text"
                    value={searchTerms.brandName}
                    onChange={(e) => setSearchTerms({ ...searchTerms, brandName: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-horns-blue"
                    placeholder="Acme Corporation"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate multiple brands with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Related Keywords (Optional)</label>
                  <input
                    type="text"
                    value={searchTerms.keywords}
                    onChange={(e) => setSearchTerms({ ...searchTerms, keywords: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-horns-blue"
                    placeholder="Acme, AcmeCorp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Exclude Terms (Optional)</label>
                  <input
                    type="text"
                    value={searchTerms.exclude}
                    onChange={(e) => setSearchTerms({ ...searchTerms, exclude: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-horns-blue"
                    placeholder="job posting, career"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Filter out irrelevant results</p>
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

          {/* Step 3: Platform Selection */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select Platforms</h2>
                <p className="text-muted-foreground">Choose where to monitor (108 total sources)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-horns-blue bg-horns-blue/10'
                        : 'border-border bg-card hover:border-horns-blue/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center font-bold text-card-foreground">
                        {platform.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{platform.name}</h3>
                        <p className="text-sm text-muted-foreground">{platform.sources} sources</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-horns-blue bg-horns-blue'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedPlatforms.includes(platform.id) && (
                        <div className="w-3 h-3 bg-white rounded-sm" />
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
                  disabled={selectedPlatforms.length === 0}
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Time Range */}
          {wizardStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Time Range</h2>
                <p className="text-muted-foreground">How far back should we look?</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['24h', '7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`p-6 rounded-lg border-2 text-center ${
                      timeRange === range
                        ? 'border-horns-blue bg-horns-blue/10 text-horns-blue'
                        : 'border-border bg-card text-card-foreground hover:border-horns-blue/50'
                    }`}
                  >
                    <p className="text-2xl font-bold mb-1">{range}</p>
                    <p className="text-xs text-muted-foreground">
                      {range === '24h' && 'Real-time'}
                      {range === '7d' && 'Last week'}
                      {range === '30d' && 'Last month'}
                      {range === '90d' && 'Last quarter'}
                    </p>
                  </button>
                ))}
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

          {/* Step 5: Alert Configuration */}
          {wizardStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Alert Configuration</h2>
                <p className="text-muted-foreground">Set thresholds and delivery preferences</p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Negative Sentiment Threshold</label>
                    <span className="text-sm text-horns-blue">{alertConfig.negativeThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={alertConfig.negativeThreshold}
                    onChange={(e) => setAlertConfig({ ...alertConfig, negativeThreshold: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Alert when negative mentions exceed this percentage</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Positive Sentiment Threshold</label>
                    <span className="text-sm text-horns-blue">{alertConfig.positiveThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={alertConfig.positiveThreshold}
                    onChange={(e) => setAlertConfig({ ...alertConfig, positiveThreshold: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Celebrate when positive mentions exceed this percentage</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Alert Delivery</label>
                  <div className="space-y-2">
                    {['email', 'sms', 'slack'].map((method) => (
                      <button
                        key={method}
                        onClick={() => toggleDelivery(method)}
                        className={`w-full p-3 rounded-lg border-2 text-left flex items-center justify-between ${
                          alertConfig.delivery.includes(method)
                            ? 'border-horns-blue bg-horns-blue/10'
                            : 'border-border bg-secondary'
                        }`}
                      >
                        <span className="capitalize">{method}</span>
                        <div className={`w-5 h-5 rounded border-2 ${
                          alertConfig.delivery.includes(method)
                            ? 'border-horns-blue bg-horns-blue'
                            : 'border-muted-foreground'
                        }`}>
                          {alertConfig.delivery.includes(method) && (
                            <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
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
                  onClick={() => setWizardStep(6)}
                  className="flex-1 py-3 bg-horns-blue text-white rounded-lg hover:bg-horns-blue/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Review & Start */}
          {wizardStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review & Start Monitoring</h2>
                <p className="text-muted-foreground">Confirm your monitoring parameters</p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Intent</p>
                    <p className="font-semibold capitalize">{selectedIntent} Monitor</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Brand</p>
                    <p className="font-semibold">{searchTerms.brandName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Platforms</p>
                    <p className="font-semibold">{selectedPlatforms.length} selected</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Range</p>
                    <p className="font-semibold">{timeRange}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Alert Threshold</p>
                    <p className="font-semibold">{alertConfig.negativeThreshold}% negative</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery</p>
                    <p className="font-semibold capitalize">{alertConfig.delivery.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setWizardStep(5)}
                  className="flex-1 py-3 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStartMonitoring}
                  disabled={loading}
                  className="flex-1 py-3 bg-horns-blue text-white rounded-lg hover:bg-horns-blue/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Start Monitoring</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && showResults && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Sentiment Overview</h2>
              <p className="text-muted-foreground">Last 30 days • {sentimentStats.total.toLocaleString()} mentions</p>
            </div>
            <button
              onClick={() => { setActiveTab('search'); setShowResults(false); setWizardStep(1); }}
              className="px-4 py-2 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80"
            >
              New Monitoring
            </button>
          </div>

          {/* Sentiment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-6">Sentiment Distribution</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Positive */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgb(74, 222, 128)"
                      strokeWidth="20"
                      strokeDasharray={`${sentimentStats.positive_pct * 2.51} 251`}
                      strokeDashoffset="0"
                    />
                    {/* Neutral */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgb(250, 204, 21)"
                      strokeWidth="20"
                      strokeDasharray={`${sentimentStats.neutral_pct * 2.51} 251`}
                      strokeDashoffset={`-${sentimentStats.positive_pct * 2.51}`}
                    />
                    {/* Negative */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgb(248, 113, 113)"
                      strokeWidth="20"
                      strokeDasharray={`${sentimentStats.negative_pct * 2.51} 251`}
                      strokeDashoffset={`-${(sentimentStats.positive_pct + sentimentStats.neutral_pct) * 2.51}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400">{sentimentStats.positive_pct}%</p>
                      <p className="text-sm text-muted-foreground">Positive</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <button
                  onClick={() => handleSentimentCardClick('positive')}
                  className={`text-center p-3 rounded-lg transition-all cursor-pointer ${
                    sentimentFilter === 'positive'
                      ? 'bg-green-500/20 ring-2 ring-green-500'
                      : 'hover:bg-green-500/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm font-semibold text-green-400">{sentimentStats.positive_pct}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sentimentStats.positive.toLocaleString()} Positive</p>
                </button>
                <button
                  onClick={() => handleSentimentCardClick('neutral')}
                  className={`text-center p-3 rounded-lg transition-all cursor-pointer ${
                    sentimentFilter === 'neutral'
                      ? 'bg-yellow-500/20 ring-2 ring-yellow-500'
                      : 'hover:bg-yellow-500/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-400">{sentimentStats.neutral_pct}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sentimentStats.neutral.toLocaleString()} Neutral</p>
                </button>
                <button
                  onClick={() => handleSentimentCardClick('negative')}
                  className={`text-center p-3 rounded-lg transition-all cursor-pointer ${
                    sentimentFilter === 'negative'
                      ? 'bg-red-500/20 ring-2 ring-red-500'
                      : 'hover:bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="text-sm font-semibold text-red-400">{sentimentStats.negative_pct}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sentimentStats.negative.toLocaleString()} Negative</p>
                </button>
              </div>
            </div>

            {/* Platform Breakdown */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-4">Platform Breakdown</h3>
              <div className="space-y-4">
                {platformStats.map((platform, idx) => {
                  const platformId = platform.name.toLowerCase().replace(/\//g, '').replace(' ', '') as 'twitter' | 'reddit' | 'news' | 'reviews'
                  const mappedId = platform.name === 'Twitter/X' ? 'twitter' : platform.name === 'News Sites' ? 'news' : platform.name.toLowerCase() as 'twitter' | 'reddit' | 'news' | 'reviews'
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePlatformCardClick(mappedId)}
                      className={`w-full p-3 rounded-lg transition-all cursor-pointer text-left ${
                        platformFilter === mappedId
                          ? 'bg-horns-blue/20 ring-2 ring-horns-blue'
                          : 'hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{platform.name}</span>
                        <span className="text-sm text-muted-foreground">{platform.mentions.toLocaleString()} mentions</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-horns-blue"
                          style={{ width: `${(platform.mentions / sentimentStats.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{platform.sentiment}% sentiment score</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Alert Banner */}
          <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-400">Negative Sentiment Spike Detected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  23% increase in negative mentions related to "product outage" in the last 5 days. <button onClick={handleSpikeDetailsClick} className="text-horns-blue cursor-pointer hover:underline">View details →</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentions Tab */}
      {activeTab === 'mentions' && showResults && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Brand Mentions</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSentimentFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sentimentFilter === 'all'
                    ? 'bg-horns-blue text-white'
                    : 'bg-secondary text-card-foreground hover:bg-secondary/80'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSentimentFilter('positive')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sentimentFilter === 'positive'
                    ? 'bg-green-500 text-white'
                    : 'bg-secondary text-card-foreground hover:bg-secondary/80'
                }`}
              >
                Positive
              </button>
              <button
                onClick={() => setSentimentFilter('negative')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sentimentFilter === 'negative'
                    ? 'bg-red-500 text-white'
                    : 'bg-secondary text-card-foreground hover:bg-secondary/80'
                }`}
              >
                Negative
              </button>
              <button
                onClick={() => setSentimentFilter('neutral')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sentimentFilter === 'neutral'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-secondary text-card-foreground hover:bg-secondary/80'
                }`}
              >
                Neutral
              </button>
            </div>
          </div>

          {/* Platform Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Platform:</span>
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                platformFilter === 'all'
                  ? 'bg-horns-blue text-white'
                  : 'bg-secondary text-card-foreground hover:bg-secondary/80'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPlatformFilter('twitter')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                platformFilter === 'twitter'
                  ? 'bg-horns-blue text-white'
                  : 'bg-secondary text-card-foreground hover:bg-secondary/80'
              }`}
            >
              Twitter/X
            </button>
            <button
              onClick={() => setPlatformFilter('reddit')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                platformFilter === 'reddit'
                  ? 'bg-horns-blue text-white'
                  : 'bg-secondary text-card-foreground hover:bg-secondary/80'
              }`}
            >
              Reddit
            </button>
            <button
              onClick={() => setPlatformFilter('news')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                platformFilter === 'news'
                  ? 'bg-horns-blue text-white'
                  : 'bg-secondary text-card-foreground hover:bg-secondary/80'
              }`}
            >
              News
            </button>
            <button
              onClick={() => setPlatformFilter('reviews')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                platformFilter === 'reviews'
                  ? 'bg-horns-blue text-white'
                  : 'bg-secondary text-card-foreground hover:bg-secondary/80'
              }`}
            >
              Reviews
            </button>
          </div>

          {/* Mentions Feed */}
          <div className="space-y-4">
            {filteredMentions.map((mention) => (
              <div
                key={mention.id}
                onClick={() => handleMentionCardClick(mention)}
                className="bg-card rounded-lg p-6 border border-border hover:border-horns-blue transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center font-bold text-card-foreground">
                      {mention.platform_icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{mention.name}</h3>
                      <p className="text-sm text-muted-foreground">{mention.handle}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full border flex items-center space-x-1 ${getSentimentColor(mention.sentiment)}`}>
                    {getSentimentIcon(mention.sentiment)}
                    <span className="capitalize">{mention.sentiment}</span>
                  </span>
                </div>

                <div
                  className="text-card-foreground mb-3"
                  dangerouslySetInnerHTML={{ __html: mention.content.replace(/<span class="highlight">/g, '<span class="text-horns-blue font-semibold">') }}
                />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{mention.time}</span>
                  <span>{mention.engagement}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(mention.url, '_blank')
                    }}
                    className="px-4 py-2 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 text-sm"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredMentions.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No mentions match your filter</p>
            </div>
          )}
        </div>
      )}

      {/* Mention Detail Modal */}
      {selectedMention && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMention(null)}
        >
          <div
            className="bg-card rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mention Details</h2>
              <button
                onClick={() => setSelectedMention(null)}
                className="text-muted-foreground hover:text-card-foreground"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Author Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center font-bold text-2xl text-card-foreground">
                    {selectedMention.platform_icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground">{selectedMention.name}</h3>
                    <p className="text-muted-foreground">{selectedMention.handle}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedMention.time}</p>
                  </div>
                </div>
                <span className={`px-4 py-2 text-sm rounded-full border flex items-center space-x-2 ${getSentimentColor(selectedMention.sentiment)}`}>
                  {getSentimentIcon(selectedMention.sentiment)}
                  <span className="capitalize font-semibold">{selectedMention.sentiment}</span>
                  <span className="text-xs opacity-75">({selectedMention.sentiment_score}%)</span>
                </span>
              </div>

              {/* Platform Badge */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Platform:</span>
                <span className="px-3 py-1 bg-secondary rounded-lg text-sm font-medium capitalize">{selectedMention.platform}</span>
              </div>

              {/* Content */}
              <div className="bg-secondary/50 rounded-lg p-6">
                <div
                  className="text-card-foreground text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedMention.content.replace(/<span class="highlight">/g, '<span class="text-horns-blue font-semibold">') }}
                />
              </div>

              {/* Engagement Metrics */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Engagement</h4>
                <p className="text-lg text-card-foreground">{selectedMention.engagement}</p>
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Sentiment Analysis</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sentiment Score</span>
                      <span className="font-semibold">{selectedMention.sentiment_score}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          selectedMention.sentiment === 'positive'
                            ? 'bg-green-400'
                            : selectedMention.sentiment === 'negative'
                            ? 'bg-red-400'
                            : 'bg-yellow-400'
                        }`}
                        style={{ width: `${selectedMention.sentiment_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-border">
                <button
                  onClick={() => window.open(selectedMention.url, '_blank')}
                  className="flex-1 px-6 py-3 bg-horns-blue text-white rounded-lg hover:bg-horns-blue/90 transition-colors font-medium"
                >
                  View Original
                </button>
                <button
                  onClick={() => {
                    // Save functionality
                  }}
                  className="px-6 py-3 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    // Reply functionality
                  }}
                  className="px-6 py-3 bg-secondary text-card-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

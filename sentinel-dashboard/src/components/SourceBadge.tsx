/**
 * Source Badge Component
 *
 * Displays the source of threat intelligence data
 * (e.g., AlienVault OTX, AbuseIPDB, CrowdSec, Nuclei, etc.)
 */

interface SourceBadgeProps {
  source: string | string[]
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const sourceConfig: Record<string, { label: string; color: string; icon: string }> = {
  otx: { label: 'AlienVault OTX', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30', icon: '🔵' },
  abuseipdb: { label: 'AbuseIPDB', color: 'bg-red-500/10 text-red-500 border-red-500/30', icon: '🔴' },
  crowdsec: { label: 'CrowdSec CTI', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30', icon: '🛡️' },
  shodan: { label: 'Shodan', color: 'bg-green-500/10 text-green-500 border-green-500/30', icon: '🟢' },
  urlhaus: { label: 'URLhaus', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30', icon: '🟠' },
  nuclei: { label: 'Nuclei', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30', icon: '🔍' },
  nmap: { label: 'Nmap', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30', icon: '🌐' },
  httpx: { label: 'HTTPx', color: 'bg-teal-500/10 text-teal-500 border-teal-500/30', icon: '🔗' },
  subfinder: { label: 'Subfinder', color: 'bg-pink-500/10 text-pink-500 border-pink-500/30', icon: '🔎' },
  contextal: { label: 'Contextal', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', icon: '🦠' },
  'multi-source': { label: 'Multi-Source', color: 'bg-horns-blue/10 text-horns-blue border-horns-blue/30', icon: '🔄' },
}

export default function SourceBadge({ source, size = 'sm', showIcon = true }: SourceBadgeProps) {
  const sources = Array.isArray(source) ? source : [source]

  // If multiple sources, show "Multi-Source" badge
  if (sources.length > 1) {
    const config = sourceConfig['multi-source']
    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded border ${config.color} ${
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
        }`}
        title={`Sources: ${sources.map(s => sourceConfig[s.toLowerCase()]?.label || s).join(', ')}`}
      >
        {showIcon && <span>{config.icon}</span>}
        <span className="font-medium">{sources.length} Sources</span>
      </div>
    )
  }

  const sourceKey = sources[0].toLowerCase()
  const config = sourceConfig[sourceKey] || {
    label: sources[0],
    color: 'bg-secondary text-muted-foreground border-border',
    icon: '📡'
  }

  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded border ${config.color} ${
        size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
      }`}
    >
      {showIcon && <span>{config.icon}</span>}
      <span className="font-medium">{config.label}</span>
    </div>
  )
}

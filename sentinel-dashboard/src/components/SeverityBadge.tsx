interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low'
  size?: 'sm' | 'md' | 'lg'
}

const severityConfig = {
  critical: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
    label: 'Critical',
  },
  high: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/20',
    label: 'High',
  },
  medium: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/20',
    label: 'Medium',
  },
  low: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    label: 'Low',
  },
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
}

export default function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const config = severityConfig[severity]

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border
        ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}
      `}
    >
      {config.label}
    </span>
  )
}

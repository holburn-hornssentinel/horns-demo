'use client'

import { Sparkles } from 'lucide-react'

interface AIBadgeProps {
  confidence: number // 0-100
  recommendation?: string
  variant?: 'default' | 'compact'
}

export default function AIBadge({ confidence, recommendation, variant = 'default' }: AIBadgeProps) {
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-400 border-green-500/30 bg-green-500/10'
    if (score >= 75) return 'text-blue-400 border-blue-500/30 bg-blue-500/10'
    if (score >= 60) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
    return 'text-orange-400 border-orange-500/30 bg-orange-500/10'
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 90) return 'High Confidence'
    if (score >= 75) return 'Good Confidence'
    if (score >= 60) return 'Medium Confidence'
    return 'Low Confidence'
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium ${getConfidenceColor(confidence)}`}>
        <Sparkles className="w-3 h-3" />
        <span>AI: {confidence}%</span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getConfidenceColor(confidence)}`}>
      <Sparkles className="w-4 h-4" />
      <div className="flex flex-col">
        <div className="text-xs font-semibold">{getConfidenceLabel(confidence)}: {confidence}%</div>
        {recommendation && (
          <div className="text-xs opacity-90">
            Recommended: {recommendation}
          </div>
        )}
      </div>
    </div>
  )
}

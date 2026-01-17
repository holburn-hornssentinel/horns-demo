import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'red' | 'yellow' | 'green' | 'purple'
}

const colorClasses = {
  blue: 'bg-blue-500/10 text-blue-400',
  red: 'bg-red-500/10 text-red-400',
  yellow: 'bg-yellow-500/10 text-yellow-400',
  green: 'bg-green-500/10 text-green-400',
  purple: 'bg-purple-500/10 text-purple-400',
}

export default function MetricCard({ title, value, icon: Icon, trend, color = 'blue' }: MetricCardProps) {
  return (
    <div className="bg-horns-gray rounded-lg p-6 border border-horns-light hover:border-horns-blue transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

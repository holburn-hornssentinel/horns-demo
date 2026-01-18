'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  AlertTriangle,
  Shield,
  Eye,
  Activity,
  Server,
  MessageSquare,
  TrendingUp,
  Wrench
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Threat Intel', href: '/threats', icon: Shield },
  { name: 'OSINT', href: '/osint', icon: Eye },
  { name: 'Sentiment AI', href: '/sentiment', icon: TrendingUp },
  { name: 'Security Tools', href: '/tools', icon: Wrench },
  { name: 'Agents', href: '/agents', icon: Server },
  { name: 'HornsIQ Chat', href: '/chat', icon: MessageSquare },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-card-foreground">Horns <span className="text-primary">Sentinel</span></h1>
            <p className="text-xs text-muted-foreground">Security Operations</p>
          </div>
        </div>
      </div>

      <nav className="px-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative
                ${isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-card-foreground border-l-4 border-transparent'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <div className="bg-secondary rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Security Score</span>
            <span className="text-lg font-bold text-primary">72/100</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

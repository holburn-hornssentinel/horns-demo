'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  AlertTriangle,
  Shield,
  Eye,
  Activity,
  Server
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Threat Intel', href: '/threats', icon: Shield },
  { name: 'OSINT', href: '/osint', icon: Eye },
  { name: 'Agents', href: '/agents', icon: Server },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-horns-darker border-r border-horns-gray">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-horns-blue" />
          <div>
            <h1 className="text-xl font-bold text-white">Horns Sentinel</h1>
            <p className="text-xs text-gray-400">Security Operations</p>
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
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-horns-blue text-white'
                  : 'text-gray-400 hover:bg-horns-gray hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-horns-gray">
        <div className="bg-horns-gray rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Security Score</span>
            <span className="text-lg font-bold text-horns-yellow">72/100</span>
          </div>
          <div className="w-full bg-horns-dark rounded-full h-2">
            <div className="bg-horns-yellow h-2 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

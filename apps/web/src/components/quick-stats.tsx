'use client'

import { Card } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip-new'
import { InfoIcon, TrendingUp, Shield, Zap } from 'lucide-react'

export function QuickStats() {
  // In MVP, we'll use mock data. Later this will come from API
  const stats = [
    {
      label: 'Total Volume (24h)',
      value: '$25.8k',
      change: '+22%',
      icon: <TrendingUp className="w-5 h-5" />,
      tooltip: 'Your trading volume in the last 24 hours across all chains',
      detail: '15 trades completed'
    },
    {
      label: 'Protection Stats',
      value: '7',
      subValue: '$12.5k protected',
      icon: <Shield className="w-5 h-5" />,
      tooltip: 'High-risk trades prevented by ScamSquatch AI',
      detail: '98% accuracy rate'
    },
    {
      label: 'Optimizations',
      value: '1.2 ETH',
      subValue: '$2,280 saved',
      icon: <Zap className="w-5 h-5" />,
      tooltip: 'Total savings from optimized routes and prevented scams',
      detail: '35% avg. improvement'
    }
  ]

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Quick Stats</h2>
        <Tooltip content="Overview of your trading activity and savings">
          <InfoIcon className="w-5 h-5 text-muted-foreground" />
        </Tooltip>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Tooltip key={index} content={stat.tooltip}>
            <div className="p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors cursor-help">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <div className="text-primary">{stat.icon}</div>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    {stat.change && (
                      <div className="text-sm text-green-500">{stat.change}</div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.subValue && (
                      <div className="text-sm text-muted-foreground">{stat.subValue}</div>
                    )}
                  </div>
                  {stat.detail && (
                    <div className="text-xs text-primary/80">{stat.detail}</div>
                  )}
                </div>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </Card>
  )
}

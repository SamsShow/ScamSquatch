'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { riskScoringService, type RiskAssessment } from '@/lib/services/risk-scoring'
import type { RouteInfo } from '@/lib/api/1inch'

interface RouteComparisonProps {
  routes: RouteInfo[]
  riskAssessments: RiskAssessment[]
  onSelectRoute: (routeId: string) => void
  selectedRouteId: string | null
}

export function RouteComparison({ 
  routes, 
  riskAssessments, 
  onSelectRoute, 
  selectedRouteId 
}: RouteComparisonProps) {
  const [sortBy, setSortBy] = useState<'risk' | 'price' | 'gas' | 'amount'>('risk')

  const formatAmount = (amount: string, decimals: number) => {
    const num = parseFloat(amount) / Math.pow(10, decimals)
    return num.toFixed(6)
  }

  const formatGas = (gas: string) => {
    const num = parseFloat(gas)
    return num > 1000000 ? `${(num / 1000000).toFixed(2)}M` : num.toLocaleString()
  }

  // Sort routes based on selected criteria
  const sortedRoutes = [...routes].sort((a, b) => {
    const aIndex = routes.indexOf(a)
    const bIndex = routes.indexOf(b)
    const aRisk = riskAssessments[aIndex]
    const bRisk = riskAssessments[bIndex]

    if (!aRisk || !bRisk) return 0

    switch (sortBy) {
      case 'risk':
        return aRisk.score - bRisk.score
      case 'price':
        return a.priceImpact - b.priceImpact
      case 'gas':
        return parseFloat(a.estimatedGas) - parseFloat(b.estimatedGas)
      case 'amount':
        return parseFloat(b.toAmount) - parseFloat(a.toAmount) // Higher amount first
      default:
        return 0
    }
  })

  const getBestRoute = () => {
    return sortedRoutes.reduce((best, current) => {
      const currentIndex = routes.indexOf(current)
      const bestIndex = routes.indexOf(best)
      const currentRisk = riskAssessments[currentIndex]
      const bestRisk = riskAssessments[bestIndex]
      
      if (!currentRisk || !bestRisk) return best
      
      // Prefer lower risk, then higher amount received
      if (currentRisk.score < bestRisk.score) return current
      if (currentRisk.score === bestRisk.score) {
        return parseFloat(current.toAmount) > parseFloat(best.toAmount) ? current : best
      }
      return best
    })
  }

  const bestRoute = getBestRoute()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Route Comparison</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-dark-accent border border-border/40 rounded px-2 py-1 text-sm"
          >
            <option value="risk">Risk Level</option>
            <option value="price">Price Impact</option>
            <option value="gas">Gas Cost</option>
            <option value="amount">Amount Received</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedRoutes.map((route, index) => {
          const originalIndex = routes.indexOf(route)
          const risk = riskAssessments[originalIndex]
          const isSelected = selectedRouteId === route.id
          const isBestRoute = route.id === bestRoute.id
          
          if (!risk) return null
          
          return (
            <Card
              key={route.id}
              className={`p-4 border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand/10 border-brand'
                  : isBestRoute
                  ? 'bg-green-500/10 border-green-500'
                  : 'bg-dark border-border/40 hover:bg-dark-accent/50 hover:border-border/60'
              }`}
              onClick={() => onSelectRoute(route.id)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isBestRoute && (
                      <span className="text-green-500 text-sm font-medium">🏆 Best Route</span>
                    )}
                    <span className={riskScoringService.getRiskLevelIcon(risk.level)}>
                      {riskScoringService.getRiskLevelIcon(risk.level)}
                    </span>
                    <span className={`font-medium ${riskScoringService.getRiskLevelColor(risk.level)}`}>
                      {risk.level} Risk
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({risk.score.toFixed(0)}/100)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isSelected && (
                      <div className="text-brand font-medium">✓ Selected</div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Route {originalIndex + 1}
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-2 bg-dark-accent rounded">
                    <div className="text-xs text-muted-foreground">You Pay</div>
                    <div className="font-medium text-sm">
                      {formatAmount(route.fromAmount, route.fromToken.decimals)} {route.fromToken.symbol}
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-dark-accent rounded">
                    <div className="text-xs text-muted-foreground">You Receive</div>
                    <div className="font-medium text-sm">
                      {formatAmount(route.toAmount, route.toToken.decimals)} {route.toToken.symbol}
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-dark-accent rounded">
                    <div className="text-xs text-muted-foreground">Price Impact</div>
                    <div className={`font-medium text-sm ${
                      route.priceImpact > 5 ? 'text-orange-500' : 'text-green-500'
                    }`}>
                      {route.priceImpact.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-dark-accent rounded">
                    <div className="text-xs text-muted-foreground">Gas Cost</div>
                    <div className="font-medium text-sm">
                      {formatGas(route.estimatedGas)}
                    </div>
                  </div>
                </div>

                {/* Protocols */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Protocols</div>
                  <div className="flex flex-wrap gap-1">
                    {route.protocols.map((protocol, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-xs ${
                          riskScoringService.isProtocolTrusted(protocol)
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {protocol}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Risk Warnings */}
                {risk.warnings.length > 0 && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                    <div className="text-xs text-red-400">
                      {risk.warnings[0]} {/* Show first warning only */}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Summary */}
      <Card className="p-4 bg-dark border-border/40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Total Routes</div>
            <div className="font-medium">{routes.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Lowest Risk</div>
            <div className="font-medium text-green-500">
              {Math.min(...riskAssessments.map(r => r.score)).toFixed(0)}/100
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Highest Risk</div>
            <div className="font-medium text-red-500">
              {Math.max(...riskAssessments.map(r => r.score)).toFixed(0)}/100
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Price Impact</div>
            <div className="font-medium">
              {(routes.reduce((sum, r) => sum + r.priceImpact, 0) / routes.length).toFixed(2)}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 
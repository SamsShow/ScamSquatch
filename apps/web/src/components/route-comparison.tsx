'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip-new'
import { riskScoringService } from '@/lib/services/risk-scoring'
import type { RouteInfo } from '@/lib/api/1inch'
import type { CombinedRiskAssessment } from '@/lib/types/risk'
import { ArrowUpDown, Zap, AlertTriangle, Shield, DollarSign } from 'lucide-react'

interface RouteComparisonProps {
  routes: RouteInfo[]
  riskAssessments: CombinedRiskAssessment[]
  onSelectRoute: (routeId: string) => void
  selectedRouteId: string | null
}

type SortCriteria = 'risk' | 'price' | 'gas' | 'amount'

export function RouteComparison({ 
  routes, 
  riskAssessments, 
  onSelectRoute, 
  selectedRouteId 
}: RouteComparisonProps) {
  const [sortBy, setSortBy] = useState<SortCriteria>('risk')
  const [sortDesc, setSortDesc] = useState(true)

  const formatAmount = (amount: string, decimals: number) => {
    const num = parseFloat(amount) / Math.pow(10, decimals)
    return num.toFixed(6)
  }

  const formatGas = (gas: string) => {
    const num = parseFloat(gas)
    return num > 1000000 ? `${(num / 1000000).toFixed(2)}M` : num.toLocaleString()
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500'
    if (score >= 60) return 'text-orange-500'
    if (score >= 30) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getRiskBgColor = (score: number) => {
    if (score >= 80) return 'bg-red-500/20'
    if (score >= 60) return 'bg-orange-500/20'
    if (score >= 30) return 'bg-yellow-500/20'
    return 'bg-green-500/20'
  }

  const getRiskAssessment = (route: RouteInfo): CombinedRiskAssessment | undefined => {
    const index = routes.indexOf(route)
    return index >= 0 ? riskAssessments[index] : undefined
  }

  const getSortValue = (route: RouteInfo, criteria: SortCriteria) => {
    const risk = getRiskAssessment(route)
    
    switch (criteria) {
      case 'risk':
        return risk?.overallRiskScore ?? 100 // Default to highest risk if unknown
      case 'price':
        return route.priceImpact
      case 'gas':
        return parseFloat(route.estimatedGas)
      case 'amount':
        return parseFloat(route.toAmount)
      default:
        return 0
    }
  }

  const toggleSort = (criteria: SortCriteria) => {
    if (sortBy === criteria) {
      setSortDesc(!sortDesc)
    } else {
      setSortBy(criteria)
      setSortDesc(true)
    }
  }

  // Sort routes based on selected criteria
  const sortedRoutes = [...routes].sort((a, b) => {
    const aValue = getSortValue(a, sortBy)
    const bValue = getSortValue(b, sortBy)
    return sortDesc ? bValue - aValue : aValue - bValue
  })

  const getBestRoute = () => {
    return sortedRoutes.find(route => {
      const risk = getRiskAssessment(route)
      return risk && risk.overallRiskScore < 50
    })
  }

  const bestRoute = getBestRoute()

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleSort('risk')}
          className={sortBy === 'risk' ? 'border-primary' : ''}
        >
          <Shield className="w-4 h-4 mr-2" />
          Risk Score {sortBy === 'risk' && (sortDesc ? '↓' : '↑')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleSort('price')}
          className={sortBy === 'price' ? 'border-primary' : ''}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Price Impact {sortBy === 'price' && (sortDesc ? '↓' : '↑')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleSort('gas')}
          className={sortBy === 'gas' ? 'border-primary' : ''}
        >
          <Zap className="w-4 h-4 mr-2" />
          Gas Cost {sortBy === 'gas' && (sortDesc ? '↓' : '↑')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleSort('amount')}
          className={sortBy === 'amount' ? 'border-primary' : ''}
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Output Amount {sortBy === 'amount' && (sortDesc ? '↓' : '↑')}
        </Button>
      </div>

      {/* Route Cards */}
      <div className="grid gap-4">
        {bestRoute && bestRoute.id !== selectedRouteId && (
          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium text-green-500">Recommended Route</h4>
                <p className="text-sm text-muted-foreground">
                  Best balance of safety and efficiency
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectRoute(bestRoute.id)}
                className="border-green-500 text-green-500 hover:bg-green-500/20"
              >
                Select Safe Route
              </Button>
            </div>
          </Card>
        )}

        {sortedRoutes.map((route, index) => {
          const risk = getRiskAssessment(route)
          const isSelected = route.id === selectedRouteId

          if (!risk) return null // Skip if no risk assessment available

          return (
            <Card
              key={route.id}
              className={`p-4 transition-colors cursor-pointer hover:border-primary/50 ${
                isSelected ? 'border-primary bg-primary/5' : 'border-border/40'
              }`}
              onClick={() => onSelectRoute(route.id)}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getRiskBgColor(risk.overallRiskScore)}`}>
                      <AlertTriangle className={`w-4 h-4 ${getRiskColor(risk.overallRiskScore)}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Route {index + 1}</span>
                        {isSelected && (
                          <span className="text-sm text-primary">Selected</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        {route.protocols.map((protocol, i) => (
                          <span key={i}>
                            {i > 0 && " → "}
                            {protocol}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Tooltip content="Overall risk score based on multiple factors">
                      <div className={`font-bold ${getRiskColor(risk.overallRiskScore)}`}>
                        {risk.overallRiskScore.toFixed(0)}%
                      </div>
                    </Tooltip>
                    <div className="text-sm text-muted-foreground">Risk Score</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">You Receive</div>
                    <div className="font-medium">
                      {formatAmount(route.toAmount, route.toToken.decimals)} {route.toToken.symbol}
                    </div>
                  </div>
                  <div>
                    <Tooltip content="Higher impact means more price slippage">
                      <div className="text-muted-foreground">Price Impact</div>
                    </Tooltip>
                    <div className={`font-medium ${
                      route.priceImpact > 5 ? 'text-red-500' :
                      route.priceImpact > 2 ? 'text-orange-500' :
                      'text-green-500'
                    }`}>
                      {route.priceImpact.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <Tooltip content="Estimated gas cost for the transaction">
                      <div className="text-muted-foreground">Gas Cost</div>
                    </Tooltip>
                    <div className="font-medium">
                      {formatGas(route.estimatedGas)} GWEI
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {risk.warnings.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="text-sm text-orange-500">
                      {risk.warnings[0]}
                      {risk.warnings.length > 1 && ` (+${risk.warnings.length - 1} more)`}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
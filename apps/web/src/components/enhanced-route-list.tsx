'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { selectRoute } from '@/store/slices/swap'
import { riskScoringService, type RiskAssessment } from '@/lib/services/risk-scoring'
import { RouteFlow } from '@/components/route-flow'
import { SafeAlternative } from '@/components/safe-alternative'
import { RouteComparison } from '@/components/route-comparison'
import { DetailedRiskBreakdown } from '@/components/detailed-risk-breakdown'
import type { RouteInfo } from '@/lib/api/1inch'

interface EnhancedRouteListProps {
  routes: RouteInfo[]
  riskAssessments: RiskAssessment[]
}

export function EnhancedRouteList({ routes, riskAssessments }: EnhancedRouteListProps) {
  const dispatch = useAppDispatch()
  const { selectedRouteId } = useAppSelector((state) => state.swap)
  
  const [showFlow, setShowFlow] = useState<string | null>(null)
  const [showSafeAlternative, setShowSafeAlternative] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'comparison'>('list')

  const handleRouteSelect = (routeId: string) => {
    (dispatch as any)(selectRoute(routeId))
  }

  const handleSafeAlternativeSelect = (routeId: string) => {
    handleRouteSelect(routeId)
    setShowSafeAlternative(null)
  }

  const formatAmount = (amount: string, decimals: number) => {
    const num = parseFloat(amount) / Math.pow(10, decimals)
    return num.toFixed(6)
  }

  const formatGas = (gas: string) => {
    const num = parseFloat(gas)
    return num > 1000000 ? `${(num / 1000000).toFixed(2)}M` : num.toLocaleString()
  }

  const getPriceImpactColor = (impact: number) => {
    if (impact > 10) return 'text-red-500'
    if (impact > 5) return 'text-orange-500'
    if (impact > 2) return 'text-yellow-500'
    return 'text-green-500'
  }

  if (routes.length === 0) {
    return (
      <Card className="p-6 bg-dark border-border/40">
        <div className="text-center text-muted-foreground">
          No routes found. Try adjusting your swap parameters.
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Available Routes</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'comparison' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('comparison')}
          >
            Comparison View
          </Button>
        </div>
      </div>
      
      {viewMode === 'comparison' ? (
        <RouteComparison
          routes={routes}
          riskAssessments={riskAssessments}
          onSelectRoute={handleRouteSelect}
          selectedRouteId={selectedRouteId}
        />
      ) : (
        <>
          {routes.map((route, index) => {
        const risk = riskAssessments[index]
        const isSelected = selectedRouteId === route.id
        
        if (!risk) {
          return null
        }
        
        const isHighRisk = risk.level === 'HIGH' || risk.level === 'CRITICAL'
        
        return (
          <div key={route.id} className="space-y-4">
            <Card
              className={`p-4 border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand/10 border-brand'
                  : 'bg-dark border-border/40 hover:bg-dark-accent/50 hover:border-border/60'
              }`}
              onClick={() => handleRouteSelect(route.id)}
            >
              <div className="space-y-3">
                {/* Header with Risk Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
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
                    {isHighRisk && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowSafeAlternative(route.id)
                        }}
                        className="text-green-500 border-green-500 hover:bg-green-500/10"
                      >
                        Find Safer Route
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowFlow(showFlow === route.id ? null : route.id)
                      }}
                    >
                      {showFlow === route.id ? 'Hide Flow' : 'Show Flow'}
                    </Button>
                    
                    {isSelected && (
                      <div className="text-brand font-medium">✓ Selected</div>
                    )}
                  </div>
                </div>

                {/* Route Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">You Pay</div>
                    <div className="font-medium">
                      {formatAmount(route.fromAmount, route.fromToken.decimals)} {route.fromToken.symbol}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">You Receive</div>
                    <div className="font-medium">
                      {formatAmount(route.toAmount, route.toToken.decimals)} {route.toToken.symbol}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Price Impact</div>
                    <div className={`font-medium ${getPriceImpactColor(route.priceImpact)}`}>
                      {route.priceImpact.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Gas Cost</div>
                    <div className="font-medium">
                      {formatGas(route.estimatedGas)}
                    </div>
                  </div>
                </div>

                {/* Protocols */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Protocols</div>
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
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                    <div className="text-sm font-medium text-red-500 mb-1">Warnings:</div>
                    <div className="space-y-1">
                      {risk.warnings.map((warning, idx) => (
                        <div key={idx} className="text-sm text-red-400 flex items-center gap-2">
                          <span>⚠️</span>
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Flow Visualization */}
            {showFlow === route.id && (
              <RouteFlow
                route={route}
                riskAssessment={risk}
                onSafeAlternative={() => setShowSafeAlternative(route.id)}
              />
            )}

            {/* Safe Alternative Modal */}
            {showSafeAlternative === route.id && (
              <SafeAlternative
                currentRoute={route}
                currentRisk={risk}
                allRoutes={routes}
                allRiskAssessments={riskAssessments}
                onSelectAlternative={handleSafeAlternativeSelect}
                onClose={() => setShowSafeAlternative(null)}
              />
            )}
          </div>
        )
      })}
        </>
      )}
    </div>
  )
} 
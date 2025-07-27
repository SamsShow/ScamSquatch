'use client'

import { useDispatch, useSelector } from 'react-redux'
import { Card } from '@/components/ui/card'
import { selectRoute } from '@/store/slices/swap'
import { riskScoringService, type RiskAssessment } from '@/lib/services/risk-scoring'
import type { RouteInfo } from '@/lib/api/1inch'
import type { RootState } from '@/store'

interface RouteListProps {
  routes: RouteInfo[]
  riskAssessments: RiskAssessment[]
}

export function RouteList({ routes, riskAssessments }: RouteListProps) {
  const dispatch = useDispatch()
  const { selectedRouteId } = useSelector((state: RootState) => state.swap)

  const handleRouteSelect = (routeId: string) => {
    // @ts-expect-error - Redux action creators are properly typed
    dispatch(selectRoute(routeId))
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
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Available Routes</h3>
      
      {routes.map((route, index) => {
        const risk = riskAssessments[index]
        const isSelected = selectedRouteId === route.id
        
        if (!risk) {
          return null
        }
        
        return (
          <Card
            key={route.id}
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
                
                {isSelected && (
                  <div className="text-brand font-medium">✓ Selected</div>
                )}
              </div>

              {/* Route Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
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
              </div>

              {/* Route Details */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Protocols</div>
                  <div className="font-medium">
                    {route.protocols.length > 0 ? route.protocols.join(' → ') : 'Direct'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Gas</div>
                  <div className="font-medium">{formatGas(route.estimatedGas)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Price Impact</div>
                  <div className={`font-medium ${getPriceImpactColor(route.priceImpact)}`}>
                    {route.priceImpact.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Risk Warnings */}
              {risk.warnings.length > 0 && (
                <div className="space-y-1">
                  {risk.warnings.map((warning, warningIndex) => (
                    <div
                      key={warningIndex}
                      className="text-xs text-orange-500 bg-orange-500/10 p-2 rounded"
                    >
                      {warning}
                    </div>
                  ))}
                </div>
              )}

              {/* Risk Factors */}
              {risk.factors.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Risk Factors:</div>
                  {risk.factors.map((factor, factorIndex) => (
                    <div key={factorIndex} className="text-xs text-muted-foreground">
                      • {factor}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
} 
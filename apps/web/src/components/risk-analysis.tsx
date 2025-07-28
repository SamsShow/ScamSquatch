'use client'

import { useSelector } from 'react-redux'
import { Card } from '@/components/ui/card'
import { RootState } from '@/store'
import { riskScoringService } from '@/lib/services/risk-scoring'

export function RiskAnalysis() {
  const { fromToken, toToken, fromChain, toChain, routes, selectedRouteId } = useSelector(
    (state: RootState) => state.swap
  )

  const selectedRoute = routes.find(route => route.id === selectedRouteId)
  const isCrossChain = fromChain?.id !== toChain?.id

  // Get risk assessment for selected route
  const getRiskAssessment = () => {
    if (!selectedRoute) return null
    return riskScoringService.assessRouteRisk(selectedRoute)
  }

  const riskAssessment = getRiskAssessment()

  return (
    <div className="space-y-4">
      {/* Chain Risk Analysis */}
      {fromChain && toChain && (
        <div className="p-4 rounded-lg bg-muted border border-border">
          <h3 className="text-lg font-medium mb-2">Chain Security</h3>
          <div className="space-y-2">
            {isCrossChain ? (
              <>
                <div className="flex items-center text-yellow-500">
                  <span className="h-4 w-4 mr-2">⚠️</span>
                  Cross-chain swap detected
                </div>
                <p className="text-sm text-muted-foreground">
                  {fromChain.name} → {toChain.name}
                </p>
              </>
            ) : (
              <div className="flex items-center text-green-500">
                <span className="h-4 w-4 mr-2">✓</span>
                Same-chain swap (lower risk)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route Risk Analysis */}
      {riskAssessment && (
        <div className="p-4 rounded-lg bg-muted border border-border">
          <h3 className="text-lg font-medium mb-2">Route Security</h3>
          <div className="space-y-2">
            <div className={`flex items-center ${riskScoringService.getRiskLevelColor(riskAssessment.level)}`}>
              <span className="h-4 w-4 mr-2">{riskScoringService.getRiskLevelIcon(riskAssessment.level)}</span>
              Risk Level: {riskAssessment.level}
            </div>
            {riskAssessment.warnings.map((warning, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Token Analysis */}
      {(fromToken || toToken) && (
        <div className="p-4 rounded-lg bg-muted border border-border">
          <h3 className="text-lg font-medium mb-2">Token Security</h3>
          <div className="space-y-2">
            {fromToken && (
              <div className="flex items-center text-muted-foreground">
                <span className="h-4 w-4 mr-2">
                  {fromToken.address === '0x0000000000000000000000000000000000000000' ? '✓' : '?'}
                </span>
                {fromToken.symbol}: {fromToken.name}
              </div>
            )}
            {toToken && (
              <div className="flex items-center text-muted-foreground">
                <span className="h-4 w-4 mr-2">
                  {toToken.address === '0x0000000000000000000000000000000000000000' ? '✓' : '?'}
                </span>
                {toToken.symbol}: {toToken.name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

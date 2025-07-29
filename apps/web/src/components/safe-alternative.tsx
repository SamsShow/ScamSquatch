'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { riskScoringService, type RiskAssessment } from '@/lib/services/risk-scoring'
import type { RouteInfo } from '@/lib/api/1inch'

interface SafeAlternativeProps {
  currentRoute: RouteInfo
  currentRisk: RiskAssessment
  allRoutes: RouteInfo[]
  allRiskAssessments: RiskAssessment[]
  onSelectAlternative: (routeId: string) => void
  onClose: () => void
}

export function SafeAlternative({ 
  currentRoute, 
  currentRisk, 
  allRoutes, 
  allRiskAssessments, 
  onSelectAlternative,
  onClose 
}: SafeAlternativeProps) {
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null)

  // Find safer alternatives
  const saferAlternatives = allRoutes
    .map((route, index) => ({
      route,
      risk: allRiskAssessments[index],
      index
    }))
    .filter(({ route, risk }) => 
      route.id !== currentRoute.id && 
      risk && risk.score < currentRisk.score &&
      risk.level !== 'CRITICAL'
    )
    .sort((a, b) => {
      if (!a.risk || !b.risk) return 0
      return a.risk.score - b.risk.score
    })
    .slice(0, 3) // Show top 3 alternatives

  const handleSelectAlternative = () => {
    if (selectedAlternative) {
      onSelectAlternative(selectedAlternative)
      onClose()
    }
  }

  if (saferAlternatives.length === 0) {
    return (
      <Card className="p-4 bg-dark border-border/40">
        <div className="text-center space-y-3">
          <div className="text-2xl">🔍</div>
          <h3 className="text-lg font-semibold">No Safer Alternatives Found</h3>
          <p className="text-sm text-muted-foreground">
            All available routes have similar or higher risk levels. Consider:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Reducing the swap amount</li>
            <li>• Using different tokens</li>
            <li>• Waiting for better liquidity</li>
          </ul>
          <Button variant="outline" onClick={onClose} className="mt-3">
            Close
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-dark border-border/40">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Safer Alternatives</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="space-y-3">
          {saferAlternatives.map(({ route, risk, index }) => {
            if (!risk) return null
            
            return (
              <div
                key={route.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAlternative === route.id
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border/40 hover:border-border/60'
                }`}
                onClick={() => setSelectedAlternative(route.id)}
              >
              <div className="flex items-center justify-between mb-2">
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
                <div className="text-sm text-muted-foreground">
                  Route {index + 1}
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protocols:</span>
                  <span className="font-medium">{route.protocols.join(' → ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Impact:</span>
                  <span className={`font-medium ${
                    route.priceImpact > 5 ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {route.priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas Cost:</span>
                  <span className="font-medium">
                    {parseFloat(route.estimatedGas).toLocaleString()}
                  </span>
                </div>
              </div>

              {risk.warnings.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/20">
                  <div className="text-xs text-red-400">
                    {risk.warnings[0]} {/* Show first warning only */}
                  </div>
                </div>
              )}
            </div>
          )
          })}
        </div>

        <div className="flex space-x-2">
          <Button
            className="flex-1 bg-green-500 hover:bg-green-600"
            disabled={!selectedAlternative}
            onClick={handleSelectAlternative}
          >
            Select Safer Route
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
} 
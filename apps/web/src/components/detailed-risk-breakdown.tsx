'use client'

import { Card } from '@/components/ui/card'
import { riskScoringService, type RiskAssessment } from '@/lib/services/risk-scoring'
import type { RouteInfo } from '@/lib/api/1inch'

interface DetailedRiskBreakdownProps {
  route: RouteInfo
  riskAssessment: RiskAssessment
}

export function DetailedRiskBreakdown({ route, riskAssessment }: DetailedRiskBreakdownProps) {
  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500'
    if (score >= 60) return 'text-orange-500'
    if (score >= 30) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getRiskScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-red-500/20'
    if (score >= 60) return 'bg-orange-500/20'
    if (score >= 30) return 'bg-yellow-500/20'
    return 'bg-green-500/20'
  }

  const getProtocolRiskLevel = (protocol: string) => {
    const isTrusted = riskScoringService.isProtocolTrusted(protocol)
    return {
      level: isTrusted ? 'LOW' : 'HIGH',
      color: isTrusted ? 'text-green-500' : 'text-red-500',
      bgColor: isTrusted ? 'bg-green-500/20' : 'bg-red-500/20',
      icon: isTrusted ? '✅' : '⚠️'
    }
  }

  const getPriceImpactRisk = (impact: number) => {
    if (impact > 10) return { level: 'CRITICAL', color: 'text-red-500', bgColor: 'bg-red-500/20' }
    if (impact > 5) return { level: 'HIGH', color: 'text-orange-500', bgColor: 'bg-orange-500/20' }
    if (impact > 2) return { level: 'MEDIUM', color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' }
    return { level: 'LOW', color: 'text-green-500', bgColor: 'bg-green-500/20' }
  }

  const priceImpactRisk = getPriceImpactRisk(route.priceImpact)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Detailed Risk Analysis</h3>

      {/* Overall Risk Score */}
      <Card className="p-4 bg-dark border-border/40">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Overall Risk Assessment</h4>
            <div className={`px-3 py-1 rounded-full ${getRiskScoreBgColor(riskAssessment.score)}`}>
              <span className={`font-bold ${getRiskScoreColor(riskAssessment.score)}`}>
                {riskAssessment.score.toFixed(0)}/100
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={riskScoringService.getRiskLevelIcon(riskAssessment.level)}>
              {riskScoringService.getRiskLevelIcon(riskAssessment.level)}
            </span>
            <span className={`font-medium ${riskScoringService.getRiskLevelColor(riskAssessment.level)}`}>
              {riskAssessment.level} Risk Level
            </span>
          </div>

          {/* Risk Score Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                riskAssessment.score >= 80 ? 'bg-red-500' :
                riskAssessment.score >= 60 ? 'bg-orange-500' :
                riskAssessment.score >= 30 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${riskAssessment.score}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Protocol Analysis */}
      <Card className="p-4 bg-dark border-border/40">
        <h4 className="font-medium mb-3">Protocol Security Analysis</h4>
        <div className="space-y-2">
          {route.protocols.map((protocol, index) => {
            const protocolRisk = getProtocolRiskLevel(protocol)
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-dark-accent rounded">
                <div className="flex items-center space-x-2">
                  <span>{protocolRisk.icon}</span>
                  <span className="font-medium">{protocol}</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${protocolRisk.bgColor}`}>
                  <span className={protocolRisk.color}>{protocolRisk.level}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Price Impact Analysis */}
      <Card className="p-4 bg-dark border-border/40">
        <h4 className="font-medium mb-3">Price Impact Analysis</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current Price Impact:</span>
            <div className={`px-3 py-1 rounded ${priceImpactRisk.bgColor}`}>
              <span className={`font-medium ${priceImpactRisk.color}`}>
                {route.priceImpact.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-500">Safe: &lt;2%</span>
              <span className="text-yellow-500">Moderate: 2-5%</span>
              <span className="text-orange-500">High: 5-10%</span>
              <span className="text-red-500">Critical: &gt;10%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  route.priceImpact > 10 ? 'bg-red-500' :
                  route.priceImpact > 5 ? 'bg-orange-500' :
                  route.priceImpact > 2 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(route.priceImpact * 10, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Cross-Chain Analysis */}
      {route.fromToken.chainId !== route.toToken.chainId && (
        <Card className="p-4 bg-dark border-border/40">
          <h4 className="font-medium mb-3">Cross-Chain Bridge Analysis</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">⚠️</span>
              <span className="font-medium">Cross-Chain Swap Detected</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Source Chain</div>
                <div className="font-medium">Chain ID: {route.fromToken.chainId}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Destination Chain</div>
                <div className="font-medium">Chain ID: {route.toToken.chainId}</div>
              </div>
            </div>

            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <div className="text-sm text-yellow-500">
                Cross-chain swaps carry additional risks including bridge vulnerabilities, 
                longer confirmation times, and potential for failed transactions.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Risk Factors */}
      <Card className="p-4 bg-dark border-border/40">
        <h4 className="font-medium mb-3">Risk Factors</h4>
        <div className="space-y-2">
          {riskAssessment.factors.map((factor, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-dark-accent rounded">
              <span className="text-red-500 mt-0.5">•</span>
              <span className="text-sm">{factor}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Warnings */}
      {riskAssessment.warnings.length > 0 && (
        <Card className="p-4 bg-red-500/10 border border-red-500/20">
          <h4 className="font-medium text-red-500 mb-3">⚠️ Critical Warnings</h4>
          <div className="space-y-2">
            {riskAssessment.warnings.map((warning, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-red-500 mt-0.5">🚨</span>
                <span className="text-sm text-red-400">{warning}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-4 bg-green-500/10 border border-green-500/20">
        <h4 className="font-medium text-green-500 mb-3">💡 Recommendations</h4>
        <div className="space-y-2 text-sm text-green-400">
          {riskAssessment.score >= 80 && (
            <div>• Consider using a different token pair or reducing the swap amount</div>
          )}
          {riskAssessment.score >= 60 && (
            <div>• Review all protocols involved and consider alternative routes</div>
          )}
          {route.priceImpact > 5 && (
            <div>• High price impact detected - consider splitting the swap into smaller amounts</div>
          )}
          {route.protocols.some(p => !riskScoringService.isProtocolTrusted(p)) && (
            <div>• Some protocols are not in our trusted list - proceed with caution</div>
          )}
          {route.fromToken.chainId !== route.toToken.chainId && (
            <div>• Cross-chain swaps require additional verification - double-check all details</div>
          )}
          {riskAssessment.score < 30 && (
            <div>• This route appears to be relatively safe based on our analysis</div>
          )}
        </div>
      </Card>
    </div>
  )
} 
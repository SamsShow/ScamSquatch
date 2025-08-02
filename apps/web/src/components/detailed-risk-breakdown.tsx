'use client'

import { Card } from '@/components/ui/card'
import { riskScoringService } from '@/lib/services/risk-scoring'
import type { RouteInfo } from '@/lib/api/1inch'
import type { CombinedRiskAssessment } from '@/lib/types/risk'
import { Tooltip } from '@/components/ui/tooltip-new'
import { InfoIcon, AlertTriangle, ShieldCheck, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DetailedRiskBreakdownProps {
  route: RouteInfo
  riskAssessment: CombinedRiskAssessment
}

interface RiskFactor {
  name: string
  weight: number
  score: number
  icon: React.ReactNode
  description: string
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

  const riskFactors: RiskFactor[] = [
    {
      name: 'Protocol Security',
      weight: 30,
      score: riskAssessment.ai.riskFactors.contractRisk * 100,
      icon: <ShieldCheck className="w-4 h-4" />,
      description: 'Evaluates protocol security and contract verification status'
    },
    {
      name: 'Price Impact',
      weight: 25,
      score: Math.min(route.priceImpact * 10, 100),
      icon: <TrendingDown className="w-4 h-4" />,
      description: 'Measures potential value loss due to market impact'
    },
    {
      name: 'Scam Probability',
      weight: 25,
      score: riskAssessment.ai.riskFactors.scamProbability * 100,
      icon: <AlertTriangle className="w-4 h-4" />,
      description: 'AI-powered assessment of scam likelihood based on historical data'
    },
    {
      name: 'Liquidity Risk',
      weight: 20,
      score: riskAssessment.ai.riskFactors.liquidityRisk * 100,
      icon: <AlertTriangle className="w-4 h-4" />,
      description: 'Assesses potential slippage and exit liquidity'
    }
  ]

  const getRecommendations = () => {
    const recs = []
    if (route.priceImpact > 5) {
      recs.push('Consider splitting your trade into smaller amounts to reduce price impact')
    }
    if (riskAssessment.ai.riskFactors.contractRisk > 0.5) {
      recs.push('High contract risk detected - proceed with extreme caution')
    }
    if (riskAssessment.ai.riskFactors.liquidityRisk > 0.5) {
      recs.push('Limited liquidity may affect ability to exit position')
    }
    if (riskAssessment.ai.riskFactors.scamProbability > 0.3) {
      recs.push('Multiple scam indicators detected - consider alternative routes')
    }
    return recs
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Detailed Risk Analysis</h3>
        <Tooltip content="Our AI analyzes multiple risk factors to protect your assets">
          <InfoIcon className="w-5 h-5 text-muted-foreground" />
        </Tooltip>
      </div>

      {/* Overall Risk Score */}
      <Card className="p-6 bg-dark border-border/40">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-lg">Overall Risk Assessment</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Based on {riskFactors.length} key risk factors
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full ${getRiskScoreBgColor(riskAssessment.overallRiskScore)}`}>
              <span className={`text-lg font-bold ${getRiskScoreColor(riskAssessment.overallRiskScore)}`}>
                {riskAssessment.overallRiskScore.toFixed(0)}/100
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`text-2xl ${riskScoringService.getRiskLevelIcon(riskAssessment.level)}`}>
              {riskScoringService.getRiskLevelIcon(riskAssessment.level)}
            </span>
            <div>
              <span className={`font-medium text-lg ${riskScoringService.getRiskLevelColor(riskAssessment.level)}`}>
                {riskAssessment.level} Risk Level
              </span>
              <p className="text-sm text-muted-foreground">
                {riskAssessment.level === 'HIGH' ? 'Exercise extreme caution' :
                 riskAssessment.level === 'MEDIUM' ? 'Proceed with caution' :
                 'Relatively safe to proceed'}
              </p>
            </div>
          </div>

          {/* Risk Score Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Risk Score</span>
              <span className={getRiskScoreColor(riskAssessment.overallRiskScore)}>
                {riskAssessment.overallRiskScore.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  riskAssessment.overallRiskScore >= 80 ? 'bg-red-500' :
                  riskAssessment.overallRiskScore >= 60 ? 'bg-orange-500' :
                  riskAssessment.overallRiskScore >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${riskAssessment.overallRiskScore}%` }}
              />
            </div>
          </div>

          {/* AI Confidence */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">AI Analysis Confidence</span>
              <span className="text-primary">{(riskAssessment.ai.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Factors Breakdown */}
      <Card className="p-6 bg-dark border-border/40">
        <h4 className="font-medium mb-4">Risk Factors</h4>
        <div className="space-y-4">
          {riskFactors.map((factor, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-primary">{factor.icon}</span>
                  <Tooltip content={factor.description}>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{factor.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({factor.weight}% weight)
                      </span>
                    </div>
                  </Tooltip>
                </div>
                <span className={getRiskScoreColor(factor.score)}>
                  {factor.score.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getRiskScoreBgColor(factor.score)}`}
                  style={{ width: `${factor.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      {getRecommendations().length > 0 && (
        <Card className="p-6 bg-dark border-border/40">
          <h4 className="font-medium mb-4">Recommendations</h4>
          <div className="space-y-3">
            {getRecommendations().map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 text-sm">
                <div className="mt-0.5 text-primary">✦</div>
                <p className="text-muted-foreground">{rec}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
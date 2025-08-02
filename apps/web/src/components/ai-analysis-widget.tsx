import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Shield, AlertTriangle, Brain, Zap, Lock } from 'lucide-react';
import { Tooltip } from './ui/tooltip';

interface AIAnalysisWidgetProps {
  analysis: {
    riskScore: number;
    confidence: number;
    riskFactors: {
      scamProbability: number;
      contractRisk: number;
      liquidityRisk: number;
      volatilityRisk: number;
    };
    warnings: string[];
    details: {
      contractAnalysis: {
        isVerified: boolean;
        hasKnownVulnerabilities: boolean;
        sourceCodeQuality: number;
        suspiciousPatterns: string[];
      };
      marketAnalysis: {
        liquidityDepth: number;
        volumeAnalysis: string;
        priceImpact: number;
        holdersDistribution: string;
      };
      reputationAnalysis: {
        communityTrust: number;
        developerActivity: string;
        socialMediaPresence: string;
        knownIncidents: string[];
      };
    };
  };
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function AIAnalysisWidget({ analysis }: AIAnalysisWidgetProps) {
  const riskColor = analysis.riskScore < 30 ? 'text-green-500' : 
                    analysis.riskScore < 60 ? 'text-yellow-500' : 
                    'text-red-500';

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-brand" />
            <CardTitle>AI Security Analysis</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content={`AI Confidence Level: ${formatPercentage(analysis.confidence)}`}>
              <div className="text-sm text-muted-foreground">
                {formatPercentage(analysis.confidence)} confidence
              </div>
            </Tooltip>
          </div>
        </div>
        <CardDescription>
          Deep learning analysis of smart contracts, market patterns, and social signals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">Risk Score</div>
            <div className={`font-bold ${riskColor}`}>
              {analysis.riskScore}/100
            </div>
          </div>
          <Progress 
            value={analysis.riskScore} 
            className={`h-2 ${
              analysis.riskScore < 30 ? 'bg-green-500' : 
              analysis.riskScore < 60 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}
          />
        </div>

        {/* Risk Factors Grid */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(analysis.riskFactors).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="text-sm flex items-center justify-between">
                <span className="text-muted-foreground">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className={value > 0.6 ? 'text-red-500' : 'text-green-500'}>
                  {formatPercentage(value)}
                </span>
              </div>
              <Progress 
                value={value * 100}
                className={`h-1 ${value > 0.6 ? 'bg-red-500' : 'bg-green-500'}`}
              />
            </div>
          ))}
        </div>

        {/* Contract Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4" />
              <h3 className="font-medium">Contract Security</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified</span>
                <span className={analysis.details.contractAnalysis.isVerified ? 'text-green-500' : 'text-red-500'}>
                  {analysis.details.contractAnalysis.isVerified ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code Quality</span>
                <span className={analysis.details.contractAnalysis.sourceCodeQuality > 0.7 ? 'text-green-500' : 'text-yellow-500'}>
                  {formatPercentage(analysis.details.contractAnalysis.sourceCodeQuality)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4" />
              <h3 className="font-medium">Market Analysis</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Liquidity</span>
                <span className={analysis.details.marketAnalysis.liquidityDepth > 500000 ? 'text-green-500' : 'text-yellow-500'}>
                  ${analysis.details.marketAnalysis.liquidityDepth.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={analysis.details.marketAnalysis.priceImpact < 0.03 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(analysis.details.marketAnalysis.priceImpact)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">AI Detected Warnings</span>
            </div>
            <ul className="space-y-1">
              {analysis.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-500/90 flex items-center gap-2">
                  <span>•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reputation Analysis */}
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <h3 className="font-medium">Community Trust Score</h3>
            </div>
            <Progress 
              value={analysis.details.reputationAnalysis.communityTrust * 100}
              className={`h-2 ${
                analysis.details.reputationAnalysis.communityTrust > 0.7 ? 'bg-green-500' : 
                analysis.details.reputationAnalysis.communityTrust > 0.4 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
            />
            <div className="text-sm text-muted-foreground">
              {analysis.details.reputationAnalysis.developerActivity}
            </div>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
}

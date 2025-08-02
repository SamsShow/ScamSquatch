import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Shield, AlertTriangle, TrendingUp, Code, Users } from 'lucide-react';

interface RiskAnalysisProps {
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

export function AIRiskAnalysis({ analysis }: RiskAnalysisProps) {
  const riskColor = React.useMemo(() => {
    if (analysis.riskScore < 30) return 'text-green-500';
    if (analysis.riskScore < 70) return 'text-yellow-500';
    return 'text-red-500';
  }, [analysis.riskScore]);

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AI Risk Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Confidence: {(analysis.confidence * 100).toFixed(1)}%
            </span>
            <div className={`text-lg font-bold ${riskColor}`}>
              {analysis.riskScore}/100
            </div>
          </div>
        </div>
        <CardDescription>
          Analyzing smart contracts, market conditions, and social signals
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {/* Warnings Section */}
        {analysis.warnings.length > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
            <div className="flex items-center gap-2 font-semibold text-yellow-800 dark:text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Warnings Detected
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm text-yellow-700 dark:text-yellow-400">
              {analysis.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Factors */}
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(analysis.riskFactors).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-brand transition-all"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
                <span className="text-sm tabular-nums">
                  {(value * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Analysis */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Contract Analysis */}
          <Card className="border-none shadow-none">
            <CardHeader className="px-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Code className="h-4 w-4" />
                Contract
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 text-sm">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span>Verified:</span>
                  <span>{analysis.details.contractAnalysis.isVerified ? '✅' : '❌'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Code Quality:</span>
                  <span>{(analysis.details.contractAnalysis.sourceCodeQuality * 100).toFixed(0)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Analysis */}
          <Card className="border-none shadow-none">
            <CardHeader className="px-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Market
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 text-sm">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span>Liquidity:</span>
                  <span>${analysis.details.marketAnalysis.liquidityDepth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price Impact:</span>
                  <span>{(analysis.details.marketAnalysis.priceImpact * 100).toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Analysis */}
          <Card className="border-none shadow-none">
            <CardHeader className="px-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 text-sm">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span>Trust Score:</span>
                  <span>{(analysis.details.reputationAnalysis.communityTrust * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Development:</span>
                  <span>{analysis.details.reputationAnalysis.developerActivity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Social:</span>
                  <span>{analysis.details.reputationAnalysis.socialMediaPresence}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suspicious Patterns */}
        {analysis.details.contractAnalysis.suspiciousPatterns.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 font-medium text-red-500">Suspicious Contract Patterns</h4>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-400">
                {analysis.details.contractAnalysis.suspiciousPatterns.map((pattern, index) => (
                  <li key={index}>{pattern}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Market Context */}
        <div className="mt-4">
          <h4 className="mb-2 font-medium">Market Context</h4>
          <div className="rounded-lg border p-4">
            <div className="text-sm">
              {analysis.details.marketAnalysis.volumeAnalysis}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Holder Distribution: {analysis.details.marketAnalysis.holdersDistribution}
            </div>
          </div>
        </div>

        {/* Known Incidents */}
        {analysis.details.reputationAnalysis.knownIncidents.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 font-medium text-orange-500">Known Security Incidents</h4>
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-900/20">
              <ul className="list-disc pl-5 text-sm text-orange-700 dark:text-orange-400">
                {analysis.details.reputationAnalysis.knownIncidents.map((incident, index) => (
                  <li key={index}>{incident}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

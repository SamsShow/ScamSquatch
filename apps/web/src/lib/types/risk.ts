export interface AIAnalysis {
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
}

export interface TraditionalRiskAssessment {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  factors: string[];
  warnings: string[];
  recommendations?: string[];
}

export interface CombinedRiskAssessment extends TraditionalRiskAssessment {
  ai: AIAnalysis;
  overallRiskScore: number;
}

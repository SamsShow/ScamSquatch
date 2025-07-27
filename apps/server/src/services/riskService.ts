import type { RouteInfo } from './oneInchService';
import type { BridgeQuote } from './bridgeService';

export interface RiskAssessment {
  score: number; // 0-100, higher = more risky
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
  warnings: string[];
}

export interface RiskFactor {
  name: string;
  weight: number;
  description: string;
}

// Risk factors for scam detection
const RISK_FACTORS: RiskFactor[] = [
  {
    name: 'Unknown Protocol',
    weight: 25,
    description: 'Route uses protocols not in our trusted list',
  },
  {
    name: 'High Price Impact',
    weight: 20,
    description: 'Swap has significant price impact (>5%)',
  },
  {
    name: 'Low Liquidity',
    weight: 15,
    description: 'Route goes through low liquidity pools',
  },
  {
    name: 'Multiple Hops',
    weight: 10,
    description: 'Route has many intermediate swaps',
  },
  {
    name: 'New Token',
    weight: 15,
    description: 'Token was created recently (<30 days)',
  },
  {
    name: 'Suspicious Contract',
    weight: 20,
    description: 'Token contract has suspicious patterns',
  },
  {
    name: 'Cross-Chain Bridge',
    weight: 15,
    description: 'Route involves cross-chain bridges',
  },
];

// Trusted protocols (whitelist)
const TRUSTED_PROTOCOLS = [
  'uniswap',
  'sushiswap',
  'pancakeswap',
  'curve',
  'balancer',
  '1inch',
  'paraswap',
  '0x',
  'kyber',
];

// Known scam patterns
const SCAM_PATTERNS = [
  'honeypot',
  'rugpull',
  'fake',
  'scam',
  'test',
  'mock',
];

class RiskService {
  // Assess risk for a single route
  async assessRouteRisk(route: RouteInfo, onChainData?: any): Promise<RiskAssessment> {
    const factors: string[] = [];
    const warnings: string[] = [];
    let totalScore = 0;

    // Check for unknown protocols
    const unknownProtocols = route.protocols.filter(
      (protocol) => !TRUSTED_PROTOCOLS.includes(protocol.toLowerCase())
    );
    if (unknownProtocols.length > 0) {
      const factor = RISK_FACTORS.find((f) => f.name === 'Unknown Protocol')!;
      totalScore += factor.weight;
      factors.push(`${factor.description}: ${unknownProtocols.join(', ')}`);
      warnings.push(`⚠️ Route uses untrusted protocols: ${unknownProtocols.join(', ')}`);
    }

    // Check price impact
    if (route.priceImpact > 5) {
      const factor = RISK_FACTORS.find((f) => f.name === 'High Price Impact')!;
      const impact = Math.min(route.priceImpact, 20); // Cap at 20%
      const score = (impact / 20) * factor.weight;
      totalScore += score;
      factors.push(`${factor.description}: ${route.priceImpact.toFixed(2)}%`);
      warnings.push(`⚠️ High price impact: ${route.priceImpact.toFixed(2)}%`);
    }

    // Check number of hops
    if (route.protocols.length > 3) {
      const factor = RISK_FACTORS.find((f) => f.name === 'Multiple Hops')!;
      totalScore += factor.weight;
      factors.push(`${factor.description}: ${route.protocols.length} hops`);
      warnings.push(`⚠️ Complex route with ${route.protocols.length} hops`);
    }

    // Check for cross-chain bridges
    if (route.fromToken.chainId !== route.toToken.chainId) {
      const factor = RISK_FACTORS.find((f) => f.name === 'Cross-Chain Bridge')!;
      totalScore += factor.weight;
      factors.push(`${factor.description}: ${route.fromToken.chainId} → ${route.toToken.chainId}`);
      warnings.push(`⚠️ Cross-chain swap detected`);
    }

    // Check token names for scam patterns
    const tokenNames = [
      route.fromToken.name.toLowerCase(),
      route.toToken.name.toLowerCase(),
      route.fromToken.symbol.toLowerCase(),
      route.toToken.symbol.toLowerCase(),
    ];

    const suspiciousTokens = tokenNames.filter((name) =>
      SCAM_PATTERNS.some((pattern) => name.includes(pattern))
    );

    if (suspiciousTokens.length > 0) {
      const factor = RISK_FACTORS.find((f) => f.name === 'Suspicious Contract')!;
      totalScore += factor.weight;
      factors.push(`${factor.description}: ${suspiciousTokens.join(', ')}`);
      warnings.push(`🚨 Suspicious token names detected`);
    }

    // Check on-chain data if available
    if (onChainData) {
      // Check if tokens are new
      if (onChainData.fromToken?.creationDate) {
        const daysSinceCreation = (Date.now() - new Date(onChainData.fromToken.creationDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 30) {
          const factor = RISK_FACTORS.find((f) => f.name === 'New Token')!;
          totalScore += factor.weight;
          factors.push(`${factor.description}: ${Math.floor(daysSinceCreation)} days old`);
          warnings.push(`⚠️ Token is only ${Math.floor(daysSinceCreation)} days old`);
        }
      }

      if (onChainData.toToken?.creationDate) {
        const daysSinceCreation = (Date.now() - new Date(onChainData.toToken.creationDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 30) {
          const factor = RISK_FACTORS.find((f) => f.name === 'New Token')!;
          totalScore += factor.weight;
          factors.push(`${factor.description}: ${Math.floor(daysSinceCreation)} days old`);
          warnings.push(`⚠️ Token is only ${Math.floor(daysSinceCreation)} days old`);
        }
      }

      // Check liquidity
      if (onChainData.fromToken?.liquidity && onChainData.fromToken.liquidity < 10000) {
        const factor = RISK_FACTORS.find((f) => f.name === 'Low Liquidity')!;
        totalScore += factor.weight;
        factors.push(`${factor.description}: $${onChainData.fromToken.liquidity.toLocaleString()}`);
        warnings.push(`⚠️ Low liquidity: $${onChainData.fromToken.liquidity.toLocaleString()}`);
      }

      if (onChainData.toToken?.liquidity && onChainData.toToken.liquidity < 10000) {
        const factor = RISK_FACTORS.find((f) => f.name === 'Low Liquidity')!;
        totalScore += factor.weight;
        factors.push(`${factor.description}: $${onChainData.toToken.liquidity.toLocaleString()}`);
        warnings.push(`⚠️ Low liquidity: $${onChainData.toToken.liquidity.toLocaleString()}`);
      }
    }

    // Determine risk level
    let level: RiskAssessment['level'] = 'LOW';
    if (totalScore >= 80) {
      level = 'CRITICAL';
    } else if (totalScore >= 60) {
      level = 'HIGH';
    } else if (totalScore >= 30) {
      level = 'MEDIUM';
    }

    return {
      score: Math.min(totalScore, 100),
      level,
      factors,
      warnings,
    };
  }

  // Assess risk for multiple routes
  async assessRoutesRisk(routes: RouteInfo[], onChainData?: any): Promise<RiskAssessment[]> {
    return Promise.all(
      routes.map((route) => this.assessRouteRisk(route, onChainData))
    );
  }

  // Get risk level color
  getRiskLevelColor(level: RiskAssessment['level']): string {
    switch (level) {
      case 'LOW':
        return 'text-green-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      case 'HIGH':
        return 'text-orange-500';
      case 'CRITICAL':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  // Get risk level background color
  getRiskLevelBgColor(level: RiskAssessment['level']): string {
    switch (level) {
      case 'LOW':
        return 'bg-green-500/10';
      case 'MEDIUM':
        return 'bg-yellow-500/10';
      case 'HIGH':
        return 'bg-orange-500/10';
      case 'CRITICAL':
        return 'bg-red-500/10';
      default:
        return 'bg-gray-500/10';
    }
  }

  // Get risk level icon
  getRiskLevelIcon(level: RiskAssessment['level']): string {
    switch (level) {
      case 'LOW':
        return '✅';
      case 'MEDIUM':
        return '⚠️';
      case 'HIGH':
        return '🚨';
      case 'CRITICAL':
        return '💀';
      default:
        return '❓';
    }
  }

  // Assess risk for bridge transactions
  async assessBridgeRisk(bridgeQuote: BridgeQuote, onChainData?: any): Promise<RiskAssessment> {
    const factors: string[] = [];
    const warnings: string[] = [];
    let totalScore = 0;

    // Cross-chain bridge risk factor
    const bridgeFactor = RISK_FACTORS.find((f) => f.name === 'Cross-Chain Bridge')!;
    totalScore += bridgeFactor.weight;
    factors.push(`${bridgeFactor.description}: ${bridgeQuote.bridgeProvider}`);
    warnings.push(`🌉 Cross-chain bridge: ${bridgeQuote.bridgeProvider}`);

    // Check bridge fee
    const bridgeFeePercentage = (parseFloat(bridgeQuote.bridgeFee) / parseFloat(bridgeQuote.fromAmount)) * 100;
    if (bridgeFeePercentage > 5) {
      totalScore += 15;
      factors.push(`High bridge fee: ${bridgeFeePercentage.toFixed(2)}%`);
      warnings.push(`⚠️ High bridge fee: ${bridgeFeePercentage.toFixed(2)}%`);
    }

    // Check estimated time
    if (bridgeQuote.estimatedTime > 600) { // More than 10 minutes
      totalScore += 10;
      factors.push(`Long bridge time: ${Math.floor(bridgeQuote.estimatedTime / 60)} minutes`);
      warnings.push(`⏱️ Long bridge time: ${Math.floor(bridgeQuote.estimatedTime / 60)} minutes`);
    }

    // Check if destination chain is supported
    const supportedChains = [11155111, 2]; // Sepolia, Aptos testnet
    if (!supportedChains.includes(bridgeQuote.toChain)) {
      totalScore += 25;
      factors.push(`Unsupported destination chain: ${bridgeQuote.toChain}`);
      warnings.push(`🚨 Unsupported destination chain: ${bridgeQuote.toChain}`);
    }

    // Check token verification on destination chain
    if (onChainData?.toToken && !onChainData.toToken.verified) {
      totalScore += 20;
      factors.push(`Unverified token on destination chain`);
      warnings.push(`⚠️ Token not verified on destination chain`);
    }

    // Determine risk level
    let level: RiskAssessment['level'] = 'LOW';
    if (totalScore >= 80) {
      level = 'CRITICAL';
    } else if (totalScore >= 60) {
      level = 'HIGH';
    } else if (totalScore >= 30) {
      level = 'MEDIUM';
    }

    return {
      score: Math.min(totalScore, 100),
      level,
      factors,
      warnings,
    };
  }
}

export const riskService = new RiskService(); 
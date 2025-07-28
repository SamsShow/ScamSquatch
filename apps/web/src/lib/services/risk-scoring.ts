import type { RouteInfo } from '@/lib/api/1inch'

export interface RiskAssessment {
  score: number // 0-100, higher = more risky
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factors: string[]
  warnings: string[]
}

export interface RiskFactor {
  name: string
  weight: number
  description: string
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
    weight: 25,  // Increased weight for cross-chain risks
    description: 'Route involves cross-chain bridges',
  },
  {
    name: 'Untrusted Bridge',
    weight: 30,
    description: 'Bridge protocol not in trusted list',
  },
  {
    name: 'Chain Specific Risk',
    weight: 20,
    description: 'Destination chain has known vulnerabilities',
  },
]

// Trusted protocols (whitelist)
const TRUSTED_PROTOCOLS = [
  // DEXs
  'uniswap',
  'sushiswap',
  'pancakeswap',
  'curve',
  'balancer',
  '1inch',
  'paraswap',
  '0x',
  'kyber',
  // Bridge Protocols
  'wormhole',
  'stargate',
  'layerzero',
  'across',
  'hop',
  'connext',
  'hyperlane',
]

// Known scam patterns
const SCAM_PATTERNS = [
  'honeypot',
  'rugpull',
  'fake',
  'scam',
  'test',
  'mock',
]

class RiskScoringService {
  // Assess risk for a single route
  assessRouteRisk(route: RouteInfo): RiskAssessment {
    const factors: string[] = []
    const warnings: string[] = []
    let totalScore = 0

    // Check for unknown protocols
    const unknownProtocols = route.protocols.filter(
      (protocol) => !TRUSTED_PROTOCOLS.includes(protocol.toLowerCase())
    )
    if (unknownProtocols.length > 0) {
      const factor = RISK_FACTORS.find((f) => f.name === 'Unknown Protocol')!
      totalScore += factor.weight
      factors.push(`${factor.description}: ${unknownProtocols.join(', ')}`)
      warnings.push(`⚠️ Route uses untrusted protocols: ${unknownProtocols.join(', ')}`)
    }

    // Check price impact
    if (route.priceImpact > 5) {
      const factor = RISK_FACTORS.find((f) => f.name === 'High Price Impact')!
      const impact = Math.min(route.priceImpact, 20) // Cap at 20%
      const score = (impact / 20) * factor.weight
      totalScore += score
      factors.push(`${factor.description}: ${route.priceImpact.toFixed(2)}%`)
      warnings.push(`⚠️ High price impact: ${route.priceImpact.toFixed(2)}%`)
    }

    // Check number of hops
    if (route.protocols.length > 3) {
      const factor = RISK_FACTORS.find((f) => f.name === 'Multiple Hops')!
      totalScore += factor.weight
      factors.push(`${factor.description}: ${route.protocols.length} hops`)
      warnings.push(`⚠️ Complex route with ${route.protocols.length} hops`)
    }

    // Check for cross-chain bridges and assess chain-specific risks
    if (route.fromToken.chainId !== route.toToken.chainId) {
      // Base cross-chain risk
      const bridgeFactor = RISK_FACTORS.find((f) => f.name === 'Cross-Chain Bridge')!
      totalScore += bridgeFactor.weight
      factors.push(`${bridgeFactor.description}: ${route.fromToken.chainId} → ${route.toToken.chainId}`)
      warnings.push(`⚠️ Cross-chain swap detected`)

      // Check if bridge protocol is trusted
      const bridgeProtocol = route.protocols.find(p => 
        p.toLowerCase().includes('bridge') || 
        p.toLowerCase().includes('portal') ||
        p.toLowerCase().includes('wormhole') ||
        p.toLowerCase().includes('layerzero')
      )
      
      if (!bridgeProtocol || !TRUSTED_PROTOCOLS.some(tp => bridgeProtocol.toLowerCase().includes(tp))) {
        const untrustedBridgeFactor = RISK_FACTORS.find((f) => f.name === 'Untrusted Bridge')!
        totalScore += untrustedBridgeFactor.weight
        factors.push(`${untrustedBridgeFactor.description}: ${bridgeProtocol || 'Unknown bridge'}`)
        warnings.push(`🚨 Untrusted or unknown bridge protocol`)
      }

      // Check destination chain risks
      // For testnet MVP we'll consider all non-Ethereum chains as higher risk
      if (route.toToken.chainId !== 1 && route.toToken.chainId !== 11155111) { // Not Ethereum or Sepolia
        const chainRiskFactor = RISK_FACTORS.find((f) => f.name === 'Chain Specific Risk')!
        totalScore += chainRiskFactor.weight
        factors.push(`${chainRiskFactor.description}: Chain ID ${route.toToken.chainId}`)
        warnings.push(`⚠️ Destination chain has additional risks`)
      }
    }

    // Check token names for scam patterns
    const tokenNames = [
      route.fromToken.name.toLowerCase(),
      route.toToken.name.toLowerCase(),
      route.fromToken.symbol.toLowerCase(),
      route.toToken.symbol.toLowerCase(),
    ]

    const suspiciousTokens = tokenNames.filter((name) =>
      SCAM_PATTERNS.some((pattern) => name.includes(pattern))
    )

    if (suspiciousTokens.length > 0) {
      const factor = RISK_FACTORS.find((f) => f.name === 'Suspicious Contract')!
      totalScore += factor.weight
      factors.push(`${factor.description}: ${suspiciousTokens.join(', ')}`)
      warnings.push(`🚨 Suspicious token names detected`)
    }

    // Determine risk level
    let level: RiskAssessment['level'] = 'LOW'
    if (totalScore >= 80) {
      level = 'CRITICAL'
    } else if (totalScore >= 60) {
      level = 'HIGH'
    } else if (totalScore >= 30) {
      level = 'MEDIUM'
    }

    return {
      score: Math.min(totalScore, 100),
      level,
      factors,
      warnings,
    }
  }

  // Assess risk for multiple routes
  assessRoutesRisk(routes: RouteInfo[]): RiskAssessment[] {
    return routes.map((route) => this.assessRouteRisk(route))
  }

  // Get risk level color
  getRiskLevelColor(level: RiskAssessment['level']): string {
    switch (level) {
      case 'LOW':
        return 'text-green-500'
      case 'MEDIUM':
        return 'text-yellow-500'
      case 'HIGH':
        return 'text-orange-500'
      case 'CRITICAL':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  // Get risk level background color
  getRiskLevelBgColor(level: RiskAssessment['level']): string {
    switch (level) {
      case 'LOW':
        return 'bg-green-500/10'
      case 'MEDIUM':
        return 'bg-yellow-500/10'
      case 'HIGH':
        return 'bg-orange-500/10'
      case 'CRITICAL':
        return 'bg-red-500/10'
      default:
        return 'bg-gray-500/10'
    }
  }

  // Get risk level icon
  getRiskLevelIcon(level: RiskAssessment['level']): string {
    switch (level) {
      case 'LOW':
        return '✅'
      case 'MEDIUM':
        return '⚠️'
      case 'HIGH':
        return '🚨'
      case 'CRITICAL':
        return '💀'
      default:
        return '❓'
    }
  }
}

export const riskScoringService = new RiskScoringService() 
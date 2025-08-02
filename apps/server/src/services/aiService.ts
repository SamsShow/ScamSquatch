import { APIError } from '../utils/errorHandler';
import pino from 'pino';

const logger = pino({
  name: 'ai-service',
  level: process.env.LOG_LEVEL || 'info'
});

interface CacheEntry {
  analysis: RiskAnalysis;
  timestamp: number;
}

interface MarketData {
  price24hChange: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  liquidityDepth: number;
}

export interface TokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
}

export interface RiskAnalysis {
  riskScore: number;  // 0-100, higher is riskier
  confidence: number; // 0-1
  riskFactors: {
    scamProbability: number;
    contractRisk: number;
    liquidityRisk: number;
    volatilityRisk: number;
  };
  warnings: string[];
  details: {
    contractAnalysis: ContractAnalysis;
    marketAnalysis: MarketAnalysis;
    reputationAnalysis: ReputationAnalysis;
  };
}

interface ContractAnalysis {
  isVerified: boolean;
  hasKnownVulnerabilities: boolean;
  sourceCodeQuality: number; // 0-1
  suspiciousPatterns: string[];
}

interface MarketAnalysis {
  liquidityDepth: number;
  volumeAnalysis: string;
  priceImpact: number;
  holdersDistribution: string;
}

interface ReputationAnalysis {
  communityTrust: number; // 0-1
  developerActivity: string;
  socialMediaPresence: string;
  knownIncidents: string[];
}

export class AIService {
  private modelCache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly KNOWN_SCAM_PATTERNS = [
    'blacklist',
    'whitelist',
    'selfdestruct',
    'owner.transfer',
    'taxFee',
    'maxTxAmount',
    '_transfer.require',
  ];

  private readonly RISKY_CHAIN_PATTERNS = {
    crossChainBridges: {
      trusted: ['wormhole', 'layerzero', 'chainbridge', 'arbitrum', 'optimism'],
      untrusted: ['custom_bridge', 'unknown_portal', 'unverified_bridge'],
    },
    crossChainRisk: new Map([
      [1, 0.1],  // Ethereum Mainnet (lowest risk)
      [11155111, 0.2], // Sepolia
      [137, 0.3], // Polygon
      [43114, 0.4], // Avalanche
      [56, 0.4],  // BSC
      [42161, 0.3], // Arbitrum
      [10, 0.3],  // Optimism
    ]),
  };

  private readonly MARKET_RISK_THRESHOLDS = {
    volume: {
      low: 100000,  // $100k daily volume
      medium: 1000000,  // $1M daily volume
      high: 10000000,  // $10M daily volume
    },
    liquidity: {
      low: 50000,   // $50k liquidity
      medium: 500000,  // $500k liquidity
      high: 5000000,  // $5M liquidity
    },
    holders: {
      low: 100,
      medium: 1000,
      high: 10000,
    },
  };

  constructor() {
    logger.info('🤖 Initialized AI Service');
    // Clean up expired cache entries periodically
    setInterval(() => this.cleanupCache(), 60 * 1000);
  }

  async analyzeRoute(params: {
    fromToken: TokenMetadata;
    toToken: TokenMetadata;
    route: string;
    amount: string;
  }): Promise<RiskAnalysis> {
    try {
      logger.info({ params }, '🔍 Analyzing route with AI model');

      // Check cache first
      const cacheKey = this.getCacheKey(params);
      const cachedAnalysis = this.modelCache.get(cacheKey);
      if (cachedAnalysis) {
        return cachedAnalysis.analysis;
      }

      // Simulate AI model processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock AI analysis based on token properties and route
      const analysis = await this.mockAIAnalysis(params);
      
      // Cache the result
      this.modelCache.set(cacheKey, { analysis, timestamp: Date.now() });

      return analysis;
    } catch (error) {
      logger.error(error, '❌ Error analyzing route with AI model');
      
      // Return a safe fallback analysis instead of throwing
      const fallbackAnalysis: RiskAnalysis = {
        riskScore: 50, // Neutral risk score
        confidence: 0.5,
        riskFactors: {
          scamProbability: 0.5,
          contractRisk: 0.5,
          liquidityRisk: 0.5,
          volatilityRisk: 0.5,
        },
        warnings: ['Unable to complete full risk analysis'],
        details: {
          contractAnalysis: {
            isVerified: false,
            hasKnownVulnerabilities: false,
            sourceCodeQuality: 0.5,
            suspiciousPatterns: [],
          },
          marketAnalysis: {
            liquidityDepth: 0,
            volumeAnalysis: 'Analysis unavailable',
            priceImpact: 0,
            holdersDistribution: 'Unknown',
          },
          reputationAnalysis: {
            communityTrust: 0.5,
            developerActivity: 'Unknown',
            socialMediaPresence: 'Unknown',
            knownIncidents: [],
          },
        },
      };
      
      return fallbackAnalysis;
    }
  }

  private getCacheKey(params: {
    fromToken: TokenMetadata;
    toToken: TokenMetadata;
    route: string;
    amount: string;
  }): string {
    return `${params.fromToken.chainId}-${params.fromToken.address}-${params.toToken.address}-${params.route}-${params.amount}`;
  }

  private async mockAIAnalysis(params: {
    fromToken: TokenMetadata;
    toToken: TokenMetadata;
    route: string;
    amount: string;
  }): Promise<RiskAnalysis> {
    const isNewToken = Math.random() > 0.7;
    const hasLowLiquidity = Math.random() > 0.8;
    const isVerifiedContract = Math.random() > 0.3;

    const marketData = await this.getMarketData(params.toToken);

    let riskScore = this.calculateRiskScore(isNewToken, hasLowLiquidity, isVerifiedContract, marketData);
    const confidence = 0.85 + (Math.random() * 0.15);

    const warnings: string[] = [];
    if (isNewToken) warnings.push('Token was recently created');
    if (hasLowLiquidity) warnings.push('Low liquidity pool detected');
    if (!isVerifiedContract) warnings.push('Contract code is not verified');

    const volatilityScore = this.calculateVolatilityScore(marketData);
    const holderDistributionRisk = this.calculateHolderDistributionRisk(marketData);

    // Add cross-chain risk analysis
    const isCrossChain = params.fromToken.chainId !== params.toToken.chainId;
    if (isCrossChain) {
      const fromChainRisk = this.RISKY_CHAIN_PATTERNS.crossChainRisk.get(params.fromToken.chainId) || 0.5;
      const toChainRisk = this.RISKY_CHAIN_PATTERNS.crossChainRisk.get(params.toToken.chainId) || 0.5;
      
      const bridgeProtocol = JSON.parse(params.route)?.bridge?.toLowerCase() || '';
      const isTrustedBridge = this.RISKY_CHAIN_PATTERNS.crossChainBridges.trusted
        .some(bridge => bridgeProtocol.includes(bridge));

      if (!isTrustedBridge) {
        warnings.push('Untrusted or unknown bridge protocol detected');
        riskScore += 20;
      }

      riskScore += ((fromChainRisk + toChainRisk) / 2) * 30;
    }

    // Enhanced market data analysis
    if (marketData) {
      const volumeRisk = this.calculateVolumeRisk(marketData.volume24h);
      const liquidityRisk = this.calculateLiquidityRisk(marketData.liquidityDepth);
      const holdersRisk = this.calculateHolderDistributionRisk(marketData);

      riskScore += volumeRisk * 15;
      riskScore += liquidityRisk * 20;
      riskScore += holdersRisk * 10;

      if (volumeRisk > 0.7) warnings.push('Unusually low trading volume');
      if (liquidityRisk > 0.7) warnings.push('Critically low liquidity');
      if (holdersRisk > 0.7) warnings.push('High concentration of token holders');
    }

    // Final risk score normalization
    riskScore = Math.min(100, Math.max(0, riskScore));

    return {
      riskScore,
      confidence,
      riskFactors: {
        scamProbability: isNewToken ? 0.7 : 0.1,
        contractRisk: isVerifiedContract ? 0.2 : 0.8,
        liquidityRisk: hasLowLiquidity ? 0.9 : 0.3,
        volatilityRisk: volatilityScore,
      },
      warnings,
      details: {
        contractAnalysis: {
          isVerified: isVerifiedContract,
          hasKnownVulnerabilities: Math.random() > 0.8,
          sourceCodeQuality: isVerifiedContract ? 0.8 : 0.3,
          suspiciousPatterns: await this.analyzeContractPatterns(params.toToken),
        },
        marketAnalysis: {
          liquidityDepth: marketData?.liquidityDepth || (hasLowLiquidity ? 10000 : 1000000),
          volumeAnalysis: this.generateVolumeAnalysis(hasLowLiquidity),
          priceImpact: hasLowLiquidity ? 0.15 : 0.02,
          holdersDistribution: this.generateHoldersDistribution(isNewToken),
        },
        reputationAnalysis: {
          communityTrust: isNewToken ? 0.3 : 0.8,
          developerActivity: this.generateDevActivity(isVerifiedContract),
          socialMediaPresence: this.generateSocialPresence(isNewToken),
          knownIncidents: [],
        },
      },
    };
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.modelCache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.modelCache.delete(key);
      }
    }
  }

  private async getMarketData(token: TokenMetadata): Promise<MarketData | null> {
    try {
      // Input validation
      if (!token?.address || !token?.chainId) {
        logger.warn('Invalid token metadata provided to getMarketData');
        return null;
      }

      // TODO: Integrate with actual market data provider
      // For now, return mock data with more stable values based on chainId
      const baseVolume = token.chainId === 1 ? 10000000 : 1000000; // Higher volume for mainnet
      const baseLiquidity = token.chainId === 1 ? 5000000 : 500000; // Higher liquidity for mainnet
      
      return {
        price24hChange: Math.max(-10, Math.min(10, -5 + Math.random() * 10)), // Clamp between -10% and +10%
        volume24h: baseVolume + Math.random() * (baseVolume * 0.5),
        marketCap: baseVolume * 10 + Math.random() * (baseVolume * 5),
        holders: Math.max(100, 1000 + Math.floor(Math.random() * 9000)),
        liquidityDepth: baseLiquidity + Math.random() * (baseLiquidity * 0.5)
      };
    } catch (error) {
      logger.error({ error, token }, 'Failed to fetch market data');
      // Return safe default values instead of null
      return {
        price24hChange: 0,
        volume24h: 0,
        marketCap: 0,
        holders: 0,
        liquidityDepth: 0
      };
    }
  }

  private async analyzeContractPatterns(token: TokenMetadata): Promise<string[]> {
    try {
      // TODO: Integrate with blockchain explorer API to fetch contract code
      // For now, return random patterns
      return this.KNOWN_SCAM_PATTERNS.filter(() => Math.random() > 0.8);
    } catch (error) {
      logger.error(error, 'Failed to analyze contract patterns');
      return [];
    }
  }

  private calculateVolatilityScore(marketData: MarketData | null): number {
    if (!marketData) return 0.5;
    
    // High volatility if 24h price change > 20% or < -20%
    const priceVolatility = Math.abs(marketData.price24hChange) > 20 ? 0.8 : 0.3;
    
    // Low volume relative to market cap indicates potential manipulation
    const volumeToMcapRatio = marketData.volume24h / marketData.marketCap;
    const volumeVolatility = volumeToMcapRatio < 0.1 ? 0.7 : 0.2;
    
    return (priceVolatility + volumeVolatility) / 2;
  }

  private calculateHolderDistributionRisk(marketData: MarketData | null): number {
    if (!marketData) return 0.5;
    
    // Higher risk if fewer holders
    if (marketData.holders < 100) return 0.9;
    if (marketData.holders < 1000) return 0.6;
    if (marketData.holders < 5000) return 0.3;
    return 0.1;
  }

  private calculateRiskScore(isNewToken: boolean, hasLowLiquidity: boolean, isVerifiedContract: boolean, marketData: MarketData | null): number {
    let score = 30; // Base score
    if (isNewToken) score += 30;
    if (hasLowLiquidity) score += 20;
    if (!isVerifiedContract) score += 20;

    if (marketData) {
      const volatilityRisk = this.calculateVolatilityScore(marketData);
      const holderRisk = this.calculateHolderDistributionRisk(marketData);

      score += volatilityRisk * 20;
      score += holderRisk * 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateVolumeRisk(volume24h: number): number {
    if (volume24h >= this.MARKET_RISK_THRESHOLDS.volume.high) return 0.1;
    if (volume24h >= this.MARKET_RISK_THRESHOLDS.volume.medium) return 0.3;
    if (volume24h >= this.MARKET_RISK_THRESHOLDS.volume.low) return 0.6;
    return 0.9;
  }

  private calculateLiquidityRisk(liquidity: number): number {
    if (liquidity >= this.MARKET_RISK_THRESHOLDS.liquidity.high) return 0.1;
    if (liquidity >= this.MARKET_RISK_THRESHOLDS.liquidity.medium) return 0.4;
    if (liquidity >= this.MARKET_RISK_THRESHOLDS.liquidity.low) return 0.7;
    return 0.9;
  }

  private generateVolumeAnalysis(hasLowLiquidity: boolean): string {
    if (hasLowLiquidity) {
      return 'Low trading volume in the past 24 hours with suspicious trade patterns';
    }
    return 'Healthy trading volume with normal distribution of trades';
  }

  private generateHoldersDistribution(isNewToken: boolean): string {
    if (isNewToken) {
      return 'Top 3 holders control 95% of supply';
    }
    return 'Well-distributed token holdings across 1000+ addresses';
  }

  private generateDevActivity(isVerifiedContract: boolean): string {
    if (isVerifiedContract) {
      return 'Regular updates and active development team';
    }
    return 'Limited or no visible development activity';
  }

  private generateSocialPresence(isNewToken: boolean): string {
    if (isNewToken) {
      return 'Limited social media presence with recent creation dates';
    }
    return 'Established presence on major platforms with active community';
  }
}

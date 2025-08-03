// Configuration
const API_BASE_URL = 'https://api.1inch.dev/fusion';
const API_KEY = process.env.ONE_INCH_API_KEY;
const MAX_PRICE_IMPACT = 0.05; // 5% max price impact
const MAX_SLIPPAGE = 0.01; // 1% max slippage

// Interfaces
export interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
  chainId: number;
  name: string;
}

export interface RouteInfo {
  id: string;
  protocols: string[];
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  gasCost: string;
  priceImpact: number;
  riskScore: number;
  riskFactors: RiskFactor[];
  fromChainId: number;
  toChainId: number;
  bridge?: string;
}

export interface SwapQuote {
  routes: RouteInfo[];
}

interface RiskFactor {
  type: 'PRICE_IMPACT' | 'CONTRACT_VERIFICATION' | 'LIQUIDITY' | 'BRIDGE_SECURITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

interface BridgeCheckResponse {
  secure: boolean;
  reasons?: string[];
}

interface LiquidityResponse {
  value: number;
  token0: string;
  token1: string;
}

interface AllowanceResponse {
  value: string;
  token: string;
  owner: string;
}

interface SwapRoute {
  id: string;
  protocols: string[];
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  gasCost: string;
  priceImpact: number;
  fromChainId: number;
  toChainId: number;
  bridge?: string;
}

interface SwapQuoteResponse {
  routes: SwapRoute[];
}

class OneInchService {
  private async request(endpoint: string, options: RequestInit = {}) {
    if (!API_KEY) {
      throw new Error('1inch API key not configured');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('1inch API: Making request to:', url);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('1inch API: HTTP error:', response.status, error);
        throw new Error(`1inch API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      console.log('1inch API: Response data:', data);
      return data;
    } catch (error) {
      console.error('1inch API: Request failed:', error);
      throw error;
    }
  }

  // Get supported tokens for a chain
  async getTokens(chainId: number): Promise<{ success: boolean; data?: TokenInfo[]; error?: string }> {
    try {
      console.log('1inch API: Fetching tokens for chainId:', chainId);
      
      if (!API_KEY) {
        console.warn('1inch API: No API key configured, using fallback tokens');
        return { success: true, data: this.getPopularTokens(chainId) };
      }
      
      const response = await this.request(`/tokens?chainId=${chainId}`);
      return { success: true, data: (response as { tokens: TokenInfo[] }).tokens || [] };
    } catch (error) {
      console.error('1inch API: Failed to fetch tokens:', error);
      console.log('1inch API: Using fallback tokens for chainId:', chainId);
      return { success: true, data: this.getPopularTokens(chainId) };
    }
  }

  // Get popular tokens for a chain (fallback)
  private getPopularTokens(chainId: number): TokenInfo[] {
    const tokens: Record<number, TokenInfo[]> = {
      11155111: [ // Sepolia
        {
          symbol: 'ETH',
          address: '0x0000000000000000000000000000000000000000',
          decimals: 18,
          chainId: 11155111,
          name: 'Ethereum',
        },
        {
          symbol: 'USDC',
          address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
          decimals: 6,
          chainId: 11155111,
          name: 'USD Coin',
        },
        {
          symbol: 'WETH',
          address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
          decimals: 18,
          chainId: 11155111,
          name: 'Wrapped Ethereum',
        },
      ],
      80002: [ // Polygon Amoy
        {
          symbol: 'MATIC',
          address: '0x0000000000000000000000000000000000000000',
          decimals: 18,
          chainId: 80002,
          name: 'Polygon',
        },
        {
          symbol: 'USDC',
          address: '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97',
          decimals: 6,
          chainId: 80002,
          name: 'USD Coin',
        },
        {
          symbol: 'WMATIC',
          address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
          decimals: 18,
          chainId: 80002,
          name: 'Wrapped Polygon',
        },
      ],
    };
    return tokens[chainId] || [];
  }

  // Validate route security
  private async validateRoute(route: SwapRoute, userAddress: string): Promise<{ riskScore: number; riskFactors: RiskFactor[] }> {
    const riskFactors: RiskFactor[] = [];
    let riskScore = 0;

    // Check price impact
    const priceImpact = parseFloat(route.priceImpact.toString());
    if (priceImpact > MAX_PRICE_IMPACT) {
      riskFactors.push({
        type: 'PRICE_IMPACT',
        severity: 'HIGH',
        description: `High price impact of ${(priceImpact * 100).toFixed(2)}%`
      });
      riskScore += 0.4;
    }

    // Check bridge security for cross-chain swaps
    if (route.fromChainId !== route.toChainId) {
      try {
        const bridgeCheck = await this.request(`/security/bridge-check`, {
          method: 'POST',
          body: JSON.stringify({
            fromChainId: route.fromChainId,
            toChainId: route.toChainId,
            bridge: route.bridge
          })
        }) as BridgeCheckResponse;

        if (!bridgeCheck.secure) {
          riskFactors.push({
            type: 'BRIDGE_SECURITY',
            severity: 'HIGH',
            description: 'Bridge security check failed'
          });
          riskScore += 0.4;
        }
      } catch (error) {
        console.error('Failed to check bridge security:', error);
        riskFactors.push({
          type: 'BRIDGE_SECURITY',
          severity: 'MEDIUM',
          description: 'Unable to verify bridge security'
        });
        riskScore += 0.2;
      }
    }

    // Check liquidity
    try {
      const liquidity = await this.request(
        `/liquidity?pair=${route.fromToken.address}_${route.toToken.address}&chainId=${route.fromChainId}`
      ) as LiquidityResponse;

      if (liquidity.value < 100000) { // Less than $100k liquidity
        riskFactors.push({
          type: 'LIQUIDITY',
          severity: 'MEDIUM',
          description: 'Low liquidity pool'
        });
        riskScore += 0.2;
      }
    } catch (error) {
      console.error('Failed to check liquidity:', error);
    }

    return { riskScore, riskFactors };
  }

  // Get swap routes with security validation
  async getRoutes(params: {
    fromToken: string;
    toToken: string;
    fromAmount: string;
    fromChainId: number;
    toChainId: number;
    userAddress: string;
  }): Promise<{ success: boolean; data?: SwapQuote; error?: string }> {
    try {
      const response = await this.request('/quote', {
        method: 'POST',
        body: JSON.stringify({
          ...params,
          enableEstimate: true,
          enableGasEstimate: true,
          slippage: MAX_SLIPPAGE
        }),
      }) as SwapQuoteResponse;

      // Transform and validate routes
      const routes: RouteInfo[] = await Promise.all(
        (response.routes || []).map(async (route: SwapRoute) => {
          const { riskScore, riskFactors } = await this.validateRoute(route, params.userAddress);
          
          return {
            id: route.id,
            protocols: route.protocols || [],
            fromToken: route.fromToken,
            toToken: route.toToken,
            fromAmount: route.fromAmount,
            toAmount: route.toAmount,
            estimatedGas: route.estimatedGas || '0',
            gasCost: route.gasCost || '0',
            priceImpact: route.priceImpact || 0,
            fromChainId: route.fromChainId,
            toChainId: route.toChainId,
            bridge: route.bridge,
            riskScore,
            riskFactors
          };
        })
      );

      return { success: true, data: { routes } };
    } catch (error) {
      console.error('Failed to get routes:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Execute swap with pre-execution checks
  async executeSwap(params: {
    routeId: string;
    userAddress: string;
    signature: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Pre-execution checks
      const route = await this.request(`/route/${params.routeId}`) as SwapRoute;
      const { riskScore, riskFactors } = await this.validateRoute(route, params.userAddress);

      // Block high-risk transactions
      if (riskScore >= 0.8) {
        return { 
          success: false, 
          error: 'Transaction blocked due to high risk. Risk factors: ' + 
            riskFactors.map(f => f.description).join(', ')
        };
      }

      // Check allowance
      const allowance = await this.request(`/allowance`, {
        method: 'POST',
        body: JSON.stringify({
          token: route.fromToken.address,
          owner: params.userAddress,
          chainId: route.fromChainId
        })
      }) as AllowanceResponse;

      if (BigInt(allowance.value) < BigInt(route.fromAmount)) {
        return { 
          success: false, 
          error: 'Insufficient token allowance' 
        };
      }

      // Execute swap
      const response = await this.request('/swap', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      return { success: true, data: response };
    } catch (error) {
      console.error('Failed to execute swap:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

export const oneInchService = new OneInchService();
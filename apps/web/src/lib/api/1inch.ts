export interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
  chainId: number;
  name: string;
}

export interface RiskFactor {
  type: 'PRICE_IMPACT' | 'CONTRACT_VERIFICATION' | 'LIQUIDITY' | 'BRIDGE_SECURITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
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

class OneInchAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `/api/1inch${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
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
      return data;
    } catch (error) {
      console.error('1inch API: Request failed:', error);
      throw error;
    }
  }

  // Get supported tokens for a chain
  async getTokens(chainId: number): Promise<TokenInfo[]> {
    try {
      console.log('1inch API: Fetching tokens for chainId:', chainId);
      
      const response = await this.request(`/tokens?chainId=${chainId}`);
      return response.data || this.getPopularTokens(chainId);
    } catch (error) {
      console.error('1inch API: Failed to fetch tokens:', error);
      console.log('1inch API: Using fallback tokens for chainId:', chainId);
      return this.getPopularTokens(chainId);
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

  // Get swap routes with risk assessment
  async getRoutes(params: {
    fromToken: string;
    toToken: string;
    fromAmount: string;
    fromChainId: number;
    toChainId: number;
    userAddress: string;
  }): Promise<SwapQuote> {
    try {
      const response = await this.request('/routes', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch routes:', error);
      return { routes: [] };
    }
  }

  // Check if user needs to approve token
  async checkAllowance(params: {
    token: string;
    owner: string;
    chainId: number;
  }): Promise<boolean> {
    try {
      const response = await this.request('/allowance', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      return response.data.needsApproval === false;
    } catch (error) {
      console.error('Failed to check allowance:', error);
      throw error;
    }
  }

  // Execute swap with pre-execution validation
  async executeSwap(params: {
    routeId: string;
    userAddress: string;
    signature: string;
  }): Promise<any> {
    try {
      // First check allowance
      const route = await this.request(`/route/${params.routeId}`);
      const hasAllowance = await this.checkAllowance({
        token: route.fromToken.address,
        owner: params.userAddress,
        chainId: route.fromChainId
      });

      if (!hasAllowance) {
        throw new Error('Token allowance required before swap');
      }

      // Execute swap if allowance is sufficient
      const response = await this.request('/swap', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      return response.data;
    } catch (error) {
      console.error('Failed to execute swap:', error);
      throw error;
    }
  }
}

export const oneInchAPI = new OneInchAPI();
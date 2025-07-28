const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export interface QuoteRequest {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  userAddress: string;
}

export interface QuoteResponse {
  success: boolean;
  data?: {
    routes: any[];
    riskAssessments: any[];
    onChainData: any;
  };
  error?: string;
}

class ScamSquatchAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('ScamSquatch API: Making request to:', url);
    
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
        console.error('ScamSquatch API: HTTP error:', response.status, error);
        throw new Error(`ScamSquatch API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      console.log('ScamSquatch API: Response data:', data);
      return data;
    } catch (error) {
      console.error('ScamSquatch API: Request failed:', error);
      throw error;
    }
  }

  // Get quote and risk analysis for a swap
  async getQuote(params: QuoteRequest): Promise<QuoteResponse> {
    try {
      console.log('ScamSquatch API: Getting quote for:', {
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.fromAmount,
        userAddress: params.userAddress.substring(0, 10) + '...'
      });

      const response = await this.request('/quote', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      return response;
    } catch (error) {
      console.error('Failed to get quote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get quote'
      };
    }
  }

  // Simulate transaction
  async simulateTransaction(params: {
    routeId: string;
    userAddress: string;
    fromAmount: string;
    toAmount: string;
    slippage: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('ScamSquatch API: Simulating transaction for:', {
        routeId: params.routeId,
        userAddress: params.userAddress.substring(0, 10) + '...',
        fromAmount: params.fromAmount,
        toAmount: params.toAmount,
        slippage: params.slippage
      });

      const response = await this.request('/simulate', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      return response;
    } catch (error) {
      console.error('Failed to simulate transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to simulate transaction'
      };
    }
  }

  // Get improved gas estimate
  async getGasEstimate(params: {
    routeId: string;
    userAddress: string;
    fromAmount: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('ScamSquatch API: Getting gas estimate for:', {
        routeId: params.routeId,
        userAddress: params.userAddress.substring(0, 10) + '...',
        fromAmount: params.fromAmount
      });

      const response = await this.request('/simulate/gas', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      return response;
    } catch (error) {
      console.error('Failed to get gas estimate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get gas estimate'
      };
    }
  }

  // Health check
  async healthCheck(): Promise<{ message: string; version: string; timestamp: string }> {
    try {
      const baseUrl = API_BASE_URL.replace('/api/v1', '');
      const response = await fetch(`${baseUrl}/`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export const scamsquatchApi = new ScamSquatchAPI(); 
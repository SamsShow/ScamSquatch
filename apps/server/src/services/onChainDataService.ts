const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const QUICKNODE_API_KEY = process.env.QUICKNODE_API_KEY;

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: string;
  creationDate?: string;
  liquidity?: number;
  holders?: number;
  verified?: boolean;
  contractCode?: string;
}

export interface OnChainData {
  fromToken?: TokenData;
  toToken?: TokenData;
  error?: string;
}

class OnChainDataService {
  private async requestAlchemy(endpoint: string, chainId: number): Promise<any> {
    if (!ALCHEMY_API_KEY) {
      throw new Error('Alchemy API key not configured');
    }

    const network = this.getAlchemyNetwork(chainId);
    const url = `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [endpoint, 'latest'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Alchemy API request failed:', error);
      throw error;
    }
  }

  private getAlchemyNetwork(chainId: number): string {
    switch (chainId) {
      case 1: return 'eth-mainnet';
      case 11155111: return 'eth-sepolia';
      case 137: return 'polygon-mainnet';
      case 80002: return 'polygon-amoy';
      default: return 'eth-mainnet';
    }
  }

  private async getTokenInfo(address: string, chainId: number): Promise<TokenData | null> {
    try {
      // Basic token info (name, symbol, decimals)
      const tokenInfo = await this.getBasicTokenInfo(address, chainId);
      
      // Additional on-chain data
      const additionalData = await this.getAdditionalTokenData(address, chainId);
      
      return {
        address,
        name: tokenInfo.name || '',
        symbol: tokenInfo.symbol || '',
        decimals: tokenInfo.decimals || 18,
        totalSupply: tokenInfo.totalSupply || '0',
        ...additionalData,
      };
    } catch (error) {
      console.error(`Failed to get token info for ${address}:`, error);
      return null;
    }
  }

  private async getBasicTokenInfo(address: string, chainId: number): Promise<Partial<TokenData>> {
    // ERC20 token standard function selectors
    const nameSelector = '0x06fdde03'; // name()
    const symbolSelector = '0x95d89b41'; // symbol()
    const decimalsSelector = '0x313ce567'; // decimals()
    const totalSupplySelector = '0x18160ddd'; // totalSupply()

    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.callContract(address, nameSelector, chainId),
        this.callContract(address, symbolSelector, chainId),
        this.callContract(address, decimalsSelector, chainId),
        this.callContract(address, totalSupplySelector, chainId),
      ]);

      return {
        address,
        name: this.decodeString(name),
        symbol: this.decodeString(symbol),
        decimals: parseInt(this.decodeNumber(decimals)),
        totalSupply: this.decodeNumber(totalSupply),
      };
    } catch (error) {
      console.error('Failed to get basic token info:', error);
      return { address };
    }
  }

  private async getAdditionalTokenData(address: string, chainId: number): Promise<Partial<TokenData>> {
    try {
      // For now, return mock data since we don't have full blockchain access
      // In production, this would fetch real on-chain data
      return {
        creationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        liquidity: Math.random() * 1000000,
        holders: Math.floor(Math.random() * 10000),
        verified: Math.random() > 0.3, // 70% chance of being verified
      };
    } catch (error) {
      console.error('Failed to get additional token data:', error);
      return {};
    }
  }

  private async callContract(address: string, data: string, chainId: number): Promise<string> {
    // This is a simplified version - in production you'd use proper RPC calls
    // For now, we'll return mock data
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  private decodeString(hex: string): string {
    // Simplified hex to string decoder
    if (!hex || hex === '0x') return '';
    try {
      const bytes = hex.slice(2); // Remove '0x'
      let result = '';
      for (let i = 0; i < bytes.length; i += 2) {
        const charCode = parseInt(bytes.substr(i, 2), 16);
        if (charCode === 0) break; // Null terminator
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch {
      return '';
    }
  }

  private decodeNumber(hex: string): string {
    if (!hex || hex === '0x') return '0';
    try {
      return BigInt(hex).toString();
    } catch {
      return '0';
    }
  }

  async getTokenData(params: {
    fromToken: string;
    toToken: string;
    fromChain: number;
    toChain: number;
  }): Promise<OnChainData> {
    try {
      console.log('🔍 Fetching on-chain data for tokens:', {
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromChain: params.fromChain,
        toChain: params.toChain,
      });

      const [fromTokenData, toTokenData] = await Promise.all([
        this.getTokenInfo(params.fromToken, params.fromChain),
        this.getTokenInfo(params.toToken, params.toChain),
      ]);

      return {
        fromToken: fromTokenData || undefined,
        toToken: toTokenData || undefined,
      };
    } catch (error) {
      console.error('❌ Error fetching on-chain data:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch on-chain data',
      };
    }
  }

  // Get token creation date (simplified)
  async getTokenCreationDate(address: string, chainId: number): Promise<string | null> {
    try {
      // In production, this would query the blockchain for the contract creation block
      // and then get the timestamp of that block
      const mockDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      return mockDate.toISOString();
    } catch (error) {
      console.error('Failed to get token creation date:', error);
      return null;
    }
  }

  // Get token liquidity (simplified)
  async getTokenLiquidity(address: string, chainId: number): Promise<number | null> {
    try {
      // In production, this would query DEX pools for liquidity data
      return Math.random() * 1000000;
    } catch (error) {
      console.error('Failed to get token liquidity:', error);
      return null;
    }
  }

  // Check if token is verified on Etherscan
  async isTokenVerified(address: string, chainId: number): Promise<boolean> {
    try {
      // In production, this would check Etherscan or similar block explorers
      return Math.random() > 0.3; // 70% chance of being verified
    } catch (error) {
      console.error('Failed to check token verification:', error);
      return false;
    }
  }
}

export const onChainDataService = new OnChainDataService(); 
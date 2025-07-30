import { AptosService } from './aptosService';
import { APIError } from '../utils/errorHandler';
import pino from 'pino';

const logger = pino({
  name: 'bridge-service',
  level: process.env.LOG_LEVEL || 'info'
});

export interface BridgeQuote {
  id: string;
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  bridgeFee: string;
  estimatedTime: number;
  bridgeProvider: string;
}

export interface BridgeTransaction {
  id: string;
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  bridgeFee: string;
  estimatedTime: number;
  bridgeProvider: string;
  transactionData: {
    targetChain: number;
    targetAddress: string;
    amount: string;
    fee: string;
  };
  instructions: string[];
}

export class BridgeService {
  private readonly aptosService: AptosService;

  constructor() {
    this.aptosService = new AptosService();
  }

  async getBridgeQuote(params: {
    fromChain: number;
    toChain: number;
    fromToken: string;
    toToken: string;
    fromAmount: string;
    userAddress: string;
  }): Promise<{ success: boolean; data?: BridgeQuote; error?: string }> {
    try {
      logger.info({ params }, '🌉 Getting bridge quote');

      // For MVP we only support ETH ⇄ APT
      if (params.fromChain === 11155111 && params.toChain === 2) {
        await this.aptosService.validateAddress(params.userAddress);
      }

      const quote: BridgeQuote = {
        id: `bridge-${Date.now()}`,
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.fromAmount,
        toAmount: this.calculateAmount(params.fromAmount),
        bridgeFee: this.calculateFee(params.fromAmount),
        estimatedTime: 300,
        bridgeProvider: 'Wormhole'
      };

      return { success: true, data: quote };
    } catch (error: any) {
      logger.error(error, '❌ Failed to get bridge quote');
      return { success: false, error: error.message };
    }
  }

  private calculateAmount(amount: string): string {
    // Simplified 1:1 conversion for MVP
    return amount;
  }

  private calculateFee(amount: string): string {
    // Simple 0.5% fee for MVP
    const value = BigInt(amount);
    return (value * BigInt(5) / BigInt(1000)).toString();
  }
}

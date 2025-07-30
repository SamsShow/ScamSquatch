import { AptosService } from './aptosService';
import { WormholeService, BridgeStatus } from './wormholeService';
import { APIError } from '../utils/errorHandler';
import pino from 'pino';

// For testing
export function createMockWormholeService() {
  return {
    estimateBridgeFee: vi.fn(),
    initiateBridgeTransfer: vi.fn(),
    getBridgeStatus: vi.fn()
  };
}

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

// Add transaction status interface
export interface BridgeTransactionStatus extends BridgeStatus {
  id: string;
  fromChain: number;
  toChain: number;
  fromAmount: string;
  toAmount: string;
  bridgeProvider: string;
  timestamp: number;
}

export class BridgeService {
  private readonly aptosService: AptosService;
  private readonly wormholeService: WormholeService;    constructor(
      mockAptosService?: AptosService,
      mockWormholeService?: WormholeService
    ) {
      this.aptosService = mockAptosService || new AptosService();
      this.wormholeService = mockWormholeService || new WormholeService();
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

      // Get bridge fee from Wormhole
      const bridgeFee = await this.wormholeService.estimateBridgeFee(
        params.fromChain,
        params.toChain
      );

      const quote: BridgeQuote = {
        id: `bridge-${Date.now()}`,
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.fromAmount,
        toAmount: this.calculateAmount(params.fromAmount),
        bridgeFee,
        estimatedTime: 300, // 5 minutes average
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

  async executeBridge(params: {
    quoteId: string;
    userAddress: string;
    signature: string;
  }): Promise<{ success: boolean; data?: BridgeTransaction; error?: string }> {
    try {
      logger.info({ params }, '🌉 Executing bridge transaction');

      // Create bridge transaction
      const bridgeParams = {
        fromChain: 11155111, // Sepolia
        toChain: 2, // Aptos testnet
        fromToken: '0x0000000000000000000000000000000000000000', // ETH
        toToken: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>', // APT
        amount: '1000000000000000000', // 1 ETH
        senderAddress: params.userAddress,
        recipientAddress: params.userAddress,
      };

      // Initiate bridge transfer
      const { txHash } = await this.wormholeService.initiateBridgeTransfer(bridgeParams);

      const transaction: BridgeTransaction = {
        id: params.quoteId,
        fromChain: bridgeParams.fromChain,
        toChain: bridgeParams.toChain,
        fromToken: bridgeParams.fromToken,
        toToken: bridgeParams.toToken,
        fromAmount: bridgeParams.amount,
        toAmount: this.calculateAmount(bridgeParams.amount),
        bridgeFee: await this.wormholeService.estimateBridgeFee(bridgeParams.fromChain, bridgeParams.toChain),
        estimatedTime: 300,
        bridgeProvider: 'Wormhole',
        transactionData: {
          targetChain: bridgeParams.toChain,
          targetAddress: bridgeParams.recipientAddress,
          amount: bridgeParams.amount,
          fee: await this.wormholeService.estimateBridgeFee(bridgeParams.fromChain, bridgeParams.toChain)
        },
        instructions: [
          '1. Bridge transfer initiated',
          `2. Source chain transaction hash: ${txHash}`,
          '3. Waiting for bridge confirmation (5-10 minutes)',
          '4. Tokens will be automatically sent on Aptos'
        ]
      };

      return { success: true, data: transaction };
    } catch (error: any) {
      logger.error(error, '❌ Failed to execute bridge');
      return { success: false, error: error.message };
    }
  }

  async getBridgeTransactionStatus(txHash: string, fromChain: number, toChain: number): Promise<BridgeTransactionStatus> {
    try {
      const status = await this.wormholeService.getBridgeStatus(txHash, fromChain, toChain);
      
      return {
        ...status,
        id: `bridge-${txHash}`,
        fromChain,
        toChain,
        fromAmount: '0', // Would come from transaction lookup
        toAmount: '0', // Would come from transaction lookup
        bridgeProvider: 'Wormhole',
        timestamp: Date.now()
      };
    } catch (error: any) {
      logger.error(error, '❌ Failed to get bridge transaction status');
      throw new APIError(500, 'Failed to get bridge transaction status');
    }
  }
}

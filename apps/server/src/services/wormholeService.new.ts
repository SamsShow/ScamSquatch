import { CHAIN_ID_APTOS, CHAIN_ID_ETH } from '@certusone/wormhole-sdk';
import { APIError } from '../utils/errorHandler';
import { providers } from 'ethers';
import pino from 'pino';

const logger = pino({
  name: 'wormhole-service',
  level: process.env.LOG_LEVEL || 'info'
});

export interface BridgeStatus {
  status: 'pending' | 'completed' | 'failed';
  sourceChainTx?: string;
  targetChainTx?: string;
  error?: string;
}

export class WormholeService {
  private readonly CHAIN_IDS = {
    SEPOLIA: CHAIN_ID_ETH,
    APTOS: CHAIN_ID_APTOS
  };

  private readonly sepoliaProvider: providers.Provider;
  private readonly bridgeAddress: string;
  private readonly tokenBridgeAddress: string;

  constructor() {
    this.sepoliaProvider = new providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    this.bridgeAddress = process.env.WORMHOLE_CORE_BRIDGE_ADDRESS || '';
    this.tokenBridgeAddress = process.env.WORMHOLE_TOKEN_BRIDGE_ADDRESS || '';
    logger.info('Initialized WormholeService');
  }

  async estimateBridgeFee(fromChain: number, toChain: number): Promise<string> {
    try {
      if (!this.sepoliaProvider) {
        throw new Error('Provider not initialized');
      }
      
      const feeData = await this.sepoliaProvider.getFeeData();
      if (!feeData.gasPrice) {
        throw new Error('Failed to get gas price');
      }

      // Base gas for transfer (300k) + buffer for complex operations (50k)
      const estimatedGas = BigInt(350000);
      const gasPriceWei = BigInt(feeData.gasPrice.toString());
      const totalFeeWei = gasPriceWei * estimatedGas;

      // Standard fee for MVP (0.05 ETH)
      const standardFeeWei = BigInt('50000000000000000');
      const finalFee = totalFeeWei + standardFeeWei;

      return finalFee.toString();
    } catch (error: any) {
      logger.error({ error }, '❌ Failed to estimate bridge fee');
      throw new APIError(500, `Failed to estimate bridge fee: ${error.message}`);
    }
  }

  async initiateBridgeTransfer(params: {
    fromChain: number;
    toChain: number;
    fromToken: string;
    toToken: string;
    amount: string;
    senderAddress: string;
    recipientAddress: string;
  }): Promise<{ txHash: string }> {
    try {
      // Validate input parameters
      if (!params.senderAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid sender address');
      }

      // For MVP, generate deterministic txHash based on params
      const txHash = `0x${Buffer.from(JSON.stringify({
        ...params,
        timestamp: Math.floor(Date.now() / 300000) * 300000 // Round to 5-minute intervals
      })).toString('hex').slice(0, 64)}`;

      return { txHash };
    } catch (error: any) {
      logger.error({ error, params }, '❌ Failed to initiate bridge transfer');
      throw new APIError(500, `Failed to initiate bridge transfer: ${error.message}`);
    }
  }

  async getBridgeStatus(txHash: string, fromChain: number, toChain: number): Promise<BridgeStatus> {
    try {
      // Allow any hex string starting with 0x for MVP
      if (!txHash.match(/^0x[a-fA-F0-9]+$/)) {
        throw new Error('Invalid transaction hash format');
      }

      const status: BridgeStatus = {
        status: 'pending',
        sourceChainTx: txHash
      };

      // For MVP, base status on transaction hash pattern:
      // - Completed: >= 64 chars (full hash)
      // - Failed: ends with 00
      // - Otherwise: Pending
      if (txHash.endsWith('00')) {
        status.status = 'failed';
        status.error = 'Bridge transfer failed';
      } else if (txHash.length >= 64) {
        status.status = 'completed';
        status.targetChainTx = `${txHash}1`; // Append 1 to make target tx unique
      }

      return status;
    } catch (error: any) {
      logger.error({ error, txHash }, '❌ Failed to get bridge status');
      throw new APIError(500, `Failed to get bridge status: ${error.message}`);
    }
  }
}

import { CHAIN_ID_APTOS, CHAIN_ID_ETH, getSignedVAA, parseSequenceFromLogEth } from '@certusone/wormhole-sdk';
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

      // Ensure fee is reasonable (between 0.001 and 1 ETH)
      if (totalFeeWei < BigInt('1000000000000000') || totalFeeWei > BigInt('1000000000000000000')) {
        throw new Error('Estimated fee outside reasonable range');
      }

      return totalFeeWei.toString();
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
      })).toString('hex').slice(0, 40)}`;

      return { txHash };
    } catch (error: any) {
      logger.error({ error, params }, '❌ Failed to initiate bridge transfer');
      throw new APIError(500, `Failed to initiate bridge transfer: ${error.message}`);
    }
  }

  async getBridgeStatus(txHash: string, fromChain: number, toChain: number): Promise<BridgeStatus> {
    try {
      if (!txHash.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid transaction hash format');
      }

      const now = Date.now();
      const txTimestamp = parseInt(txHash.slice(2, 10), 16) * 1000;
      const timeDiff = now - txTimestamp;

      const status: BridgeStatus = {
        status: 'pending',
        sourceChainTx: txHash
      };

      // Status logic: completed after 5 mins, failed if hash ends in 00
      if (timeDiff > 300000) { // 5 minutes
        status.status = 'completed';
        status.targetChainTx = `0x${BigInt(txHash).toString(16)}1`; // Append 1 to make target tx unique
      } else if (txHash.endsWith('00')) {
        status.status = 'failed';
        status.error = 'Bridge transfer failed';
      }

      return status;
    } catch (error: any) {
      logger.error({ error, txHash }, '❌ Failed to get bridge status');
      throw new APIError(500, `Failed to get bridge status: ${error.message}`);
    }
  }
}

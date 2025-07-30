import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WormholeService } from '../src/services/wormholeService';

const mockFeeData = {
  gasPrice: { toString: () => '50000000000' },
  maxFeePerGas: null,
  maxPriorityFeePerGas: null
};

const mockProvider = {
  getFeeData: vi.fn().mockResolvedValue(mockFeeData)
};

let providerShouldThrow = false;

vi.mock('ethers', async () => {
  return {
    ethers: {
      providers: {
        Provider: class {},
        JsonRpcProvider: vi.fn().mockImplementation((url) => {
          if (!url) throw new Error('Provider not initialized');
          if (providerShouldThrow) {
            throw new Error('Provider not initialized');
          }
          return mockProvider;
        })
      }
    },
    providers: {
      Provider: class {},
      JsonRpcProvider: vi.fn().mockImplementation((url) => {
        if (!url) throw new Error('Provider not initialized');
        if (providerShouldThrow) {
          throw new Error('Provider not initialized');
        }
        return mockProvider;
      })
    }
  };
});

describe('WormholeService', () => {
  let wormholeService: WormholeService;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env.SEPOLIA_RPC_URL = 'https://sepolia.example.com';
    process.env.WORMHOLE_CORE_BRIDGE_ADDRESS = '0x1234567890123456789012345678901234567890';
    process.env.WORMHOLE_TOKEN_BRIDGE_ADDRESS = '0x2345678901234567890123456789012345678901';
    wormholeService = new WormholeService();
  });

  describe('estimateBridgeFee', () => {
    it('should estimate bridge fee with standard fee', async () => {
      const fee = await wormholeService.estimateBridgeFee(11155111, 2);
      const feeInEth = Number(BigInt(fee)) / 1e18;

      expect(fee).toBeDefined();
      expect(typeof fee).toBe('string');
      expect(feeInEth).toBeGreaterThan(0.05); // At least standard fee
      expect(feeInEth).toBeLessThan(1); // Less than 1 ETH
    });

    it('should throw error if provider not initialized', async () => {
      delete process.env.SEPOLIA_RPC_URL;
      await expect(async () => {
        new WormholeService();
      }).rejects.toThrow('Provider not initialized');
      process.env.SEPOLIA_RPC_URL = 'https://sepolia.example.com';
    });
  });

  describe('initiateBridgeTransfer', () => {
    const validParams = {
      fromChain: 11155111,
      toChain: 2,
      fromToken: '0x0000000000000000000000000000000000000000',
      toToken: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
      amount: '1000000000000000000',
      senderAddress: '0x1234567890123456789012345678901234567890',
      recipientAddress: '0x1234567890123456789012345678901234567890'
    };

    it('should return consistent txHash for same parameters', async () => {
      const result1 = await wormholeService.initiateBridgeTransfer(validParams);
      const result2 = await wormholeService.initiateBridgeTransfer(validParams);

      expect(result1.txHash).toMatch(/^0x[a-f0-9]+$/);
      expect(result1.txHash).toBe(result2.txHash);
    });

    it('should reject invalid sender address', async () => {
      const invalidParams = {
        ...validParams,
        senderAddress: 'invalid-address'
      };

      await expect(wormholeService.initiateBridgeTransfer(invalidParams))
        .rejects
        .toThrow('Failed to initiate bridge transfer: Invalid sender address');
    });
  });

  describe('getBridgeStatus', () => {
    it('should handle invalid transaction hash', async () => {
      await expect(wormholeService.getBridgeStatus('invalid-hash', 11155111, 2))
        .rejects
        .toThrow('Failed to get bridge status: Invalid transaction hash format');
    });

    it('should return completed status for old transactions', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const status = await wormholeService.getBridgeStatus(txHash, 11155111, 2);

      expect(status.status).toBe('completed');
      expect(status.sourceChainTx).toBe(txHash);
      expect(status.targetChainTx).toBeDefined();
      expect(status.targetChainTx).toBe(`${txHash}1`);
    });

    it('should return failed status for transactions ending in 00', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678900000';
      const status = await wormholeService.getBridgeStatus(txHash, 11155111, 2);

      expect(status.status).toBe('failed');
      expect(status.sourceChainTx).toBe(txHash);
      expect(status.error).toBe('Bridge transfer failed');
    });

    it('should return pending status for recent transactions', async () => {
      const txHash = '0x1234567890123456789012345678901234567890'; // Shorter hash
      const status = await wormholeService.getBridgeStatus(txHash, 11155111, 2);

      expect(status.status).toBe('pending');
      expect(status.sourceChainTx).toBe(txHash);
      expect(status.targetChainTx).toBeUndefined();
      expect(status.error).toBeUndefined();
    });
  });
});
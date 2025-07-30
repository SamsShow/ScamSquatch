import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BridgeService, createMockWormholeService } from '../src/services/bridgeService';
import { vi } from 'vitest';
import { AptosService } from '../src/services/aptosService';
import { WormholeService } from '../src/services/wormholeService';

// Mock ethers
vi.mock('ethers', () => {
  return {
    ethers: {
      JsonRpcProvider: vi.fn().mockImplementation(() => ({
        getFeeData: vi.fn().mockResolvedValue({
          gasPrice: '20000000000'
        })
      }))
    }
  };
});

// Mock AptosService
vi.mock('../src/services/aptosService', () => ({
  AptosService: vi.fn().mockImplementation(() => ({
    validateAddress: vi.fn().mockImplementation((address: string) => {
      if (!address.match(/^0x[a-f0-9]{64}$/)) {
        throw new Error('Invalid Aptos address');
      }
      return true;
    }),
  })),
}));

// Create mock factory
function createMockWormholeInstance(overrides = {}) {
  const defaultMock = {
    // Private fields made accessible through prototype
    CHAIN_IDS: {
      SEPOLIA: 11155111,
      APTOS: 2
    },
    sepoliaProvider: {
      getFeeData: vi.fn().mockResolvedValue({
        gasPrice: {
          toString: () => '20000000000'
        }
      })
    },
    bridgeAddress: '0x1234567890123456789012345678901234567890',
    tokenBridgeAddress: '0x2345678901234567890123456789012345678901',
    // Public methods
    estimateBridgeFee: vi.fn().mockResolvedValue('50000000000000000'),
    initiateBridgeTransfer: vi.fn().mockImplementation(async (params) => {
      const txHash = `0x${Buffer.from(JSON.stringify(params)).toString('hex')}`.slice(0, 66);
      return { txHash };
    }),
    getBridgeStatus: vi.fn().mockImplementation(async (txHash: string) => ({
      status: txHash.endsWith('00') ? 'failed' : 'pending',
      sourceChainTx: txHash,
      targetChainTx: txHash.endsWith('00') ? undefined : `${txHash}1`,
      error: txHash.endsWith('00') ? 'Bridge transfer failed' : undefined
    })),
    // Getters for private fields
    getChainIds: vi.fn().mockImplementation(function() { return this.CHAIN_IDS; }),
    getSepoliaProvider: vi.fn().mockImplementation(function() { return this.sepoliaProvider; }),
    getBridgeAddress: vi.fn().mockImplementation(function() { return this.bridgeAddress; }),
    getTokenBridgeAddress: vi.fn().mockImplementation(function() { return this.tokenBridgeAddress; })
  };

  return Object.create(
    WormholeService.prototype,
    Object.getOwnPropertyDescriptors({
      ...defaultMock,
      ...overrides
    })
  );
}

// Mock WormholeService
vi.mock('../src/services/wormholeService', () => ({
  WormholeService: vi.fn().mockImplementation(() => createMockWormholeInstance())
}));

// Mock specific error cases
const mockWithError = () => createMockWormholeInstance({
  estimateBridgeFee: vi.fn().mockRejectedValue(new Error('Failed to estimate fee'))
});

const mockWithBridgeError = () => createMockWormholeInstance({
  initiateBridgeTransfer: vi.fn().mockRejectedValue(new Error('Bridge failed'))
});

describe('BridgeService', () => {
  let bridgeService: BridgeService;

  beforeEach(() => {
    vi.resetAllMocks();
    const mockAptosService = {
      validateAddress: vi.fn().mockImplementation((address: string) => {
        if (!address.match(/^0x[a-fA-F0-9]{64}$/)) {
          throw new Error('Invalid Aptos address');
        }
        return true;
      })
    };
    const wormholeService = createMockWormholeInstance();
    bridgeService = new BridgeService(mockAptosService as any, wormholeService);
  });

  describe('getBridgeQuote', () => {
    const params = {
      fromChain: 11155111, // Sepolia
      toChain: 2, // Aptos testnet
      fromToken: '0x0000000000000000000000000000000000000000',
      toToken: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
      fromAmount: '1000000000000000000',
      userAddress: '0x' + '1'.repeat(64)
    };

    it('should get quote for ETH to APT bridge', async () => {
      const wormholeService = createMockWormholeInstance();
      const mockAptosService = {
        validateAddress: vi.fn().mockReturnValue(true)
      };
      bridgeService = new BridgeService(mockAptosService as any, wormholeService);
      
      const result = await bridgeService.getBridgeQuote(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.fromChain).toBe(params.fromChain);
        expect(result.data.toChain).toBe(params.toChain);
        expect(result.data.fromToken).toBe(params.fromToken);
        expect(result.data.toToken).toBe(params.toToken);
        expect(result.data.bridgeProvider).toBe('Wormhole');
        expect(result.data.bridgeFee).toBe('50000000000000000');
      }
    });

    it('should validate Aptos address for ETH to APT bridge', async () => {
      const wormholeService = createMockWormholeInstance();
      const mockAptosService = {
        validateAddress: vi.fn().mockImplementation((address: string) => {
          if (!address.match(/^0x[a-fA-F0-9]{64}$/)) {
            throw new Error('Invalid Aptos address');
          }
          return true;
        })
      };
      bridgeService = new BridgeService(mockAptosService as any, wormholeService);

      const invalidParams = { 
        ...params, 
        userAddress: 'invalid-address' 
      };

      const result = await bridgeService.getBridgeQuote(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid Aptos address');
    });

    it('should handle bridge fee estimation error', async () => {
      const mockAptosService = {
        validateAddress: vi.fn().mockReturnValue(true)
      };
      bridgeService = new BridgeService(mockAptosService as any, mockWithError());
      
      const result = await bridgeService.getBridgeQuote(params);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to estimate fee');
    });
  });

  describe('executeBridge', () => {
    const params = {
      quoteId: 'bridge-123',
      userAddress: '0x' + '1'.repeat(64),
      signature: '0x' + '2'.repeat(130)
    };

    it('should execute bridge transaction successfully', async () => {
      const result = await bridgeService.executeBridge(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.id).toBe(params.quoteId);
        expect(result.data.fromChain).toBe(11155111);
        expect(result.data.toChain).toBe(2);
        expect(result.data.bridgeProvider).toBe('Wormhole');
        expect(result.data.instructions.length).toBeGreaterThan(0);
      }
    });

    it('should handle bridge initiation failure', async () => {
      bridgeService = new BridgeService(undefined, mockWithBridgeError());
      
      const result = await bridgeService.executeBridge(params);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bridge failed');
    });

    it('should include proper transaction data', async () => {
      const result = await bridgeService.executeBridge(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.transactionData).toBeDefined();
        expect(result.data.transactionData.targetChain).toBe(2);
        expect(result.data.transactionData.targetAddress).toBe(params.userAddress);
        expect(typeof result.data.transactionData.amount).toBe('string');
        expect(typeof result.data.transactionData.fee).toBe('string');
      }
    });
  });

  describe('getBridgeTransactionStatus', () => {
    const txHash = '0x1234567890abcdef';
    const fromChain = 11155111;
    const toChain = 2;

    it('should return bridge transaction status', async () => {
      const status = await bridgeService.getBridgeTransactionStatus(txHash, fromChain, toChain);

      expect(status).toBeDefined();
      expect(status.status).toBe('pending');
      expect(status.sourceChainTx).toBe(txHash);
      expect(status.id).toBe(`bridge-${txHash}`);
      expect(status.fromChain).toBe(fromChain);
      expect(status.toChain).toBe(toChain);
      expect(status.bridgeProvider).toBe('Wormhole');
    });

    it('should handle failed transactions', async () => {
      const failedTxHash = '0x1234567800'; // Ends with 00
      const status = await bridgeService.getBridgeTransactionStatus(failedTxHash, fromChain, toChain);

      expect(status).toBeDefined();
      expect(status.status).toBe('failed');
      expect(status.sourceChainTx).toBe(failedTxHash);
      expect(status.error).toBe('Bridge transfer failed');
    });
  });
});

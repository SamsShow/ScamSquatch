import { Request, Response } from 'express';
import { simulationService } from '../../services/simulationService';

export interface SimulationRequest {
  routeId: string;
  userAddress: string;
  fromAmount: string;
  toAmount: string;
  slippage: number;
}

export interface GasEstimateRequest {
  routeId: string;
  userAddress: string;
  fromAmount: string;
}

export const simulateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      routeId,
      userAddress,
      fromAmount,
      toAmount,
      slippage = 0.5
    }: SimulationRequest = req.body;

    // Validate required fields
    if (!routeId || !userAddress || !fromAmount || !toAmount) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: routeId, userAddress, fromAmount, toAmount'
      });
      return;
    }

    console.log('🔍 Processing simulation request:', {
      routeId,
      userAddress: userAddress.substring(0, 10) + '...',
      fromAmount,
      toAmount,
      slippage
    });

    // For now, we'll create a mock route object
    // In production, this would fetch the actual route from the database or cache
    const mockRoute = {
      id: routeId,
      protocols: ['uniswap'],
      fromToken: {
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        chainId: 11155111
      },
      toToken: {
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        chainId: 11155111
      },
      fromAmount,
      toAmount,
      estimatedGas: '150000',
      gasCost: '0',
      priceImpact: 0.5,
      route: {}
    };

    // Simulate the transaction
    const result = await simulationService.simulateTransaction({
      route: mockRoute,
      userAddress,
      fromAmount,
      toAmount,
      slippage
    });

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error || 'Simulation failed'
      });
      return;
    }

    console.log('✅ Simulation completed successfully');
    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('❌ Error simulating transaction:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

export const getGasEstimate = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      routeId,
      userAddress,
      fromAmount
    }: GasEstimateRequest = req.body;

    // Validate required fields
    if (!routeId || !userAddress || !fromAmount) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: routeId, userAddress, fromAmount'
      });
      return;
    }

    console.log('⛽ Processing gas estimate request:', {
      routeId,
      userAddress: userAddress.substring(0, 10) + '...',
      fromAmount
    });

    // For now, we'll create a mock route object
    const mockRoute = {
      id: routeId,
      protocols: ['uniswap'],
      fromToken: {
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        chainId: 11155111
      },
      toToken: {
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        chainId: 11155111
      },
      fromAmount,
      toAmount: '1000000', // Mock toAmount
      estimatedGas: '150000',
      gasCost: '0',
      priceImpact: 0.5,
      route: {}
    };

    // Get improved gas estimate
    const result = await simulationService.getImprovedGasEstimate({
      route: mockRoute,
      userAddress,
      fromAmount
    });

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error || 'Gas estimation failed'
      });
      return;
    }

    console.log('✅ Gas estimation completed successfully');
    res.json({
      success: true,
      data: {
        gasEstimate: result.gasEstimate,
        gasPrice: result.gasPrice,
        totalCost: result.totalCost
      }
    });

  } catch (error) {
    console.error('❌ Error getting gas estimate:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}; 
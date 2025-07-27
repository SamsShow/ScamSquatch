import { Request, Response } from 'express';
import { bridgeService } from '../../services/bridgeService';

export interface BridgeExecuteRequest {
  quoteId: string;
  userAddress: string;
  signature: string;
}

export interface BridgeExecuteResponse {
  success: boolean;
  data?: {
    transactionId: string;
    status: string;
    instructions: string[];
    estimatedTime: number;
  };
  error?: string;
}

export const executeBridge = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      quoteId,
      userAddress,
      signature
    }: BridgeExecuteRequest = req.body;

    // Validate required fields
    if (!quoteId || !userAddress || !signature) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: quoteId, userAddress, signature'
      });
      return;
    }

    console.log('🌉 Executing bridge transaction:', {
      quoteId,
      userAddress: userAddress.substring(0, 10) + '...',
      signature: signature.substring(0, 10) + '...'
    });

    // Execute bridge transaction
    const result = await bridgeService.executeBridge({
      quoteId,
      userAddress,
      signature
    });

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to execute bridge transaction'
      });
      return;
    }

    // Return bridge transaction details
    const response: BridgeExecuteResponse = {
      success: true,
      data: {
        transactionId: result.data!.id,
        status: 'pending',
        instructions: result.data!.instructions,
        estimatedTime: result.data!.estimatedTime
      }
    };

    console.log('✅ Bridge transaction executed successfully');
    res.json(response);

  } catch (error) {
    console.error('❌ Error executing bridge transaction:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}; 
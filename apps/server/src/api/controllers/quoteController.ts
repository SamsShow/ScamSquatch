import { Request, Response } from 'express';
import { oneInchService } from '../../services/oneInchService';
import { riskService } from '../../services/riskService';
import { onChainDataService } from '../../services/onChainDataService';
import { bridgeService } from '../../services/index';

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
    bridgeQuote?: any;
    isCrossChain: boolean;
  };
  error?: string;
}

export const getQuoteAndRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      userAddress
    }: QuoteRequest = req.body;

    // Validate required fields
    if (!fromChain || !toChain || !fromToken || !toToken || !fromAmount || !userAddress) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: fromChain, toChain, fromToken, toToken, fromAmount, userAddress'
      });
      return;
    }

    console.log('🔍 Processing quote request:', {
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      userAddress: userAddress.substring(0, 10) + '...'
    });

    // Check if this is a cross-chain request
    const isCrossChain = fromChain !== toChain;
    console.log('🌉 Cross-chain request:', isCrossChain);

    let routes: any;
    let bridgeQuote: any;
    let onChainData: any;
    let riskAssessments: any;

    if (isCrossChain) {
      // Cross-chain flow: ETH ↔ APT
      console.log('🌉 Processing cross-chain request');
      
      // Step 1: Get bridge quote
      bridgeQuote = await bridgeService.getBridgeQuote({
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount,
        userAddress
      });

      if (!bridgeQuote.success) {
        res.status(400).json({
          success: false,
          error: 'Failed to get bridge quote'
        });
        return;
      }

      // Step 2: Get on-chain data for both chains
      onChainData = await onChainDataService.getTokenData({
        fromToken,
        toToken,
        fromChain,
        toChain
      });

      // Step 3: Perform risk assessment for bridge route
      riskAssessments = [await riskService.assessBridgeRisk(bridgeQuote.data!, onChainData)];
    } else {
      // Same-chain flow: Use 1inch
      console.log('🔄 Processing same-chain request');
      
      // Step 1: Get swap routes from 1inch
      routes = await oneInchService.getRoutes({
        fromToken,
        toToken,
        fromAmount,
        fromChainId: fromChain,
        toChainId: toChain,
        userAddress
      });

      if (!routes.success || !routes.data?.routes?.length) {
        res.status(400).json({
          success: false,
          error: 'No routes found for the specified swap'
        });
        return;
      }

      // Step 2: Get on-chain data for risk analysis
      onChainData = await onChainDataService.getTokenData({
        fromToken,
        toToken,
        fromChain,
        toChain
      });

      // Step 3: Perform risk assessment for each route
      riskAssessments = await Promise.all(
        routes.data.routes.map(async (route: any) => {
          return await riskService.assessRouteRisk(route, onChainData);
        })
      );
    }

    // Step 4: Return comprehensive response
    const response: QuoteResponse = {
      success: true,
      data: {
        routes: routes?.data?.routes || [],
        riskAssessments,
        onChainData,
        bridgeQuote: bridgeQuote?.data,
        isCrossChain
      }
    };

    console.log('✅ Quote processed successfully');
    res.json(response);

  } catch (error) {
    console.error('❌ Error processing quote:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}; 
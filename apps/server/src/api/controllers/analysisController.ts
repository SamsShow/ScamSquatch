import { Request, Response } from 'express';
import { aiService } from '../../services';
import { riskService } from '../../services/riskService';
import { onChainDataService } from '../../services/onChainDataService';
import { APIError } from '../../utils/errorHandler';

export async function analyzeRoute(req: Request, res: Response) {
  try {
    const { fromToken, toToken, route, amount } = req.body;

    if (!fromToken || !toToken || !route || !amount) {
      throw new APIError('Missing required parameters', 400);
    }

    // Get on-chain data for risk assessment
    const onChainData = await onChainDataService.getTokenData({
      fromToken,
      toToken,
      fromChain: fromToken.chainId,
      toChain: toToken.chainId,
    });

    // Get traditional risk assessment
    const riskAssessment = await riskService.assessRouteRisk(route, onChainData);

    // Get AI model analysis
    const aiAnalysis = await aiService.analyzeRoute({
      fromToken,
      toToken,
      route: JSON.stringify(route),
      amount,
    });

    // Combine both analyses
    const combinedAnalysis = {
      traditional: riskAssessment,
      ai: aiAnalysis,
      overallRiskScore: (riskAssessment.score + aiAnalysis.riskScore) / 2,
      warnings: [...new Set([...riskAssessment.warnings, ...aiAnalysis.warnings])],
      recommendations: [
        ...riskAssessment.recommendations || [],
        ...(aiAnalysis.riskScore > 50 ? ['Consider alternative routes based on AI analysis'] : []),
      ],
    };

    res.json({
      success: true,
      data: combinedAnalysis,
    });
  } catch (error) {
    if (error instanceof APIError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

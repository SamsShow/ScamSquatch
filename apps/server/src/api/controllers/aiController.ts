import { Request, Response } from 'express';
import { aiService } from '../../services';
import { APIError } from '../../utils/errorHandler';

export async function analyzeRoute(req: Request, res: Response) {
  try {
    const { fromToken, toToken, route, amount } = req.body;

    if (!fromToken || !toToken || !route || !amount) {
      throw new APIError('Missing required parameters', 400);
    }

    const analysis = await aiService.analyzeRoute({
      fromToken,
      toToken,
      route,
      amount,
    });

    res.json({
      success: true,
      data: analysis,
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

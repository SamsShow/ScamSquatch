import { Router } from 'express';
import { getQuoteAndRisk } from '../controllers/quoteController';

const router: Router = Router();

// POST /api/v1/quote - Get swap quote and risk analysis
router.post('/quote', getQuoteAndRisk);

export { router as quoteRoutes }; 
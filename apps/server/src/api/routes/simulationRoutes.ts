import { Router } from 'express';
import { simulateTransaction, getGasEstimate } from '../controllers/simulationController';

const router: Router = Router();

// POST /api/v1/simulate - Simulate a transaction
router.post('/simulate', simulateTransaction);

// POST /api/v1/simulate/gas - Get improved gas estimation
router.post('/simulate/gas', getGasEstimate);

export { router as simulationRoutes }; 
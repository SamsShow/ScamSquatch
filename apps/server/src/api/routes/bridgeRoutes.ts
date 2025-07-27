import { Router } from 'express';
import { executeBridge } from '../controllers/bridgeController';

const router: Router = Router();

// POST /api/v1/bridge/execute - Execute bridge transaction
router.post('/bridge/execute', executeBridge);

export { router as bridgeRoutes }; 
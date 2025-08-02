import { Router } from 'express';
import { analyzeRoute } from '../controllers/aiController';

const router = Router();

router.post('/analyze', analyzeRoute);

export default router;

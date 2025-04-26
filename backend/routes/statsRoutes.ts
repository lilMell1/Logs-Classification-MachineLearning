import express from 'express';
import { analyzeLogsController, getLatestAnalysis, getCumulativeAnalysis } from '../controllers/analyzeLogsController';
import authenticate from '../middleware/authenticate'; 

const router = express.Router();

router.use(authenticate); 

router.post('/analyze-logs', analyzeLogsController);
router.get('/latest', getLatestAnalysis);
router.get('/cumulative', getCumulativeAnalysis);

export default router;

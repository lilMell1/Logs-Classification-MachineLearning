import express from 'express';
import { analyzeLogsController, getLatestAnalysis, getCumulativeAnalysis } from '../controllers/analyzeLogsController';

const router = express.Router();

router.post('/analyze-logs', analyzeLogsController);
router.get('/latest', getLatestAnalysis);
router.get('/cumulative', getCumulativeAnalysis);

export default router;

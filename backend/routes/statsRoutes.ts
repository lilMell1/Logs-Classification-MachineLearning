import express from 'express';
import {
  analyzeLogsController,
  getLatestAnalysis,
  getCumulativeAnalysis,
  deleteLatestAndRecalculate
} from '../controllers/analyzeLogsController';
import authenticate from '../middleware/authenticate';

const router = express.Router();

router.use(authenticate);

router.post('/analyze-logs', analyzeLogsController);
router.get('/latest', getLatestAnalysis);
router.get('/cumulative', getCumulativeAnalysis);
router.delete('/delete-latest', deleteLatestAndRecalculate);

export default router;

import express from 'express';
import authenticate from '../middleware/authenticate';
import { analyzeLogsTogether } from '../controllers/analyzeBothController';

const router = express.Router();

router.use(authenticate);
router.post('/analyze-both', analyzeLogsTogether);

export default router;

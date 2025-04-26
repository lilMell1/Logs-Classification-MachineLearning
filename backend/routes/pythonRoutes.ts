import express from 'express';
import { sendToMachine, getLatestMachineResult } from '../controllers/machineController';
import authenticate from '../middleware/authenticate'; 

const router = express.Router();
router.use(authenticate); 

router.post('/analyze-log', sendToMachine);
router.get('/latest', getLatestMachineResult);

export default router;

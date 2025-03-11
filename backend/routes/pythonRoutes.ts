import express from 'express';
import { sendToMachine } from '../controllers/machineController';

const router = express.Router();

router.post('/analyze-log', sendToMachine);

export default router;

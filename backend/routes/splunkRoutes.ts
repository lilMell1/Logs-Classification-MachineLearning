import express from 'express';
import { uploadLog, getLogs } from '../controllers/splunkController';

const router = express.Router();

// Route to upload a log to Splunk
router.post('/upload', uploadLog);

// Route to get logs from Splunk
router.get('/logs', getLogs);

export default router;

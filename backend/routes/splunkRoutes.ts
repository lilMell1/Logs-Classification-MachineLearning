import express from 'express';
import { getLogById } from '../controllers/splunkController';

const router = express.Router();

// Route to upload a log to Splunk
//router.post('/upload', uploadLog);

// Route to get logs from Splunk
router.post('/search-log-by-id', getLogById);

export default router;

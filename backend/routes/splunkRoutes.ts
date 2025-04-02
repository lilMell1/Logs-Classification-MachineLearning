import express from 'express';
import { searchLogs } from '../controllers/splunkController';

const router = express.Router();

// Route to upload a log to Splunk
//router.post('/upload', uploadLog);

// Route to get logs from Splunk
router.post('/search-logs', searchLogs);

export default router;

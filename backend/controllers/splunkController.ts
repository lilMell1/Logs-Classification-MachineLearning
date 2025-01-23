// src/controllers/splunkController.ts
import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const SPLUNK_TOKEN = process.env.SPLUNK_TOKEN as string;
const SPLUNK_URL = process.env.SPLUNK_URL as string;


// Controller to upload a log to Splunk
export const uploadLog = async (req: Request, res: Response) : Promise<void> =>{
  const { event } = req.body;
  if (!event) {
     res.status(400).json({ error: 'Event data is required' });
     return;
  }

  const payload = {
    event,
    sourcetype: '_json',
    index: 'main',
  };

  const headers = {
    'Authorization': `Splunk ${SPLUNK_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(SPLUNK_URL, payload, { headers });
     res.status(200).json({ message: 'Log uploaded successfully', response });
     return;
  } catch (error: any) {
     res.status(500).json({ error: error.message });
     return;
  }
};

// Controller to retrieve logs from Splunk
export const getLogs = async (req: Request, res: Response) : Promise<void> => {
  const query = 'search index=main sourcetype=_json | head 10';

  try {
    // Step 1: Create a search job
    const jobResponse = await axios.post<any>(
      'http://127.0.0.1:8009/services/search/jobs',
      new URLSearchParams({
        search: query,
        exec_mode: 'blocking',
      }),
      {
        headers: {
          'Authorization': `Splunk ${SPLUNK_TOKEN}`,
        },
      }
    );

    const jobId = jobResponse.data.sid;

    // Step 2: Get the results from the search job
    const resultResponse = await axios.get(
      `http://127.0.0.1:8009/services/search/jobs/${jobId}/results`,
      {
        headers: {
          'Authorization': `Splunk ${SPLUNK_TOKEN}`,
        },
      }
    );

     res.status(200).json({ logs: resultResponse.data });
     return;
  } catch (error: any) {
     res.status(500).json({ error: error.message });
     return;
  }
};

import e, { Request, Response } from 'express';
import { restrictedUserBlockedServices  } from "../utils/restrictedServices";
import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

interface LogObject {
  serviceName: string;
  timestamp: string;
  logLevel: string;
  logString: string;
  itemId: number;
  source: string;
}

// Force TLS 1.2 and bypass self-signed certificate errors
const agent = new https.Agent({
  rejectUnauthorized: false,
  secureProtocol: 'TLSv1_2_method'
});

const SPLUNK_USERNAME = process.env.SPLUNK_USERNAME as string;
const SPLUNK_PASSWORD = process.env.SPLUNK_PASSWORD as string;
const SPLUNK_URL = `${process.env.SPLUNK_URL}/services/search/jobs`;

export const searchLogs = async (req: Request, res: Response): Promise<void> => {
  console.log("searchLogs function triggered");
  const { selectedProcess, startTime, endTime, role } = req.body;

  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;

  if (start && isNaN(start.getTime())) {
    res.status(400).json({ error: "Invalid start time format" });
    return;
  }

  if (end && isNaN(end.getTime())) {
    res.status(400).json({ error: "Invalid end time format" });
    return;
  }

  if (start && end && start >= end) {
    res.status(400).json({ error: "Start time must be before end time" });
    return;
  }

  let query = `search index=${selectedProcess} sourcetype=_json`;

  try {
    const params = new URLSearchParams();
    params.append('search', query);
    params.append('exec_mode', 'blocking');
    params.append('output_mode', 'json');
    if (startTime) params.append('earliest_time', startTime);
    if (endTime) params.append('latest_time', endTime);
    console.log(startTime,endTime);
    const jobResponse = await axios.post<any>(
      SPLUNK_URL,
      params,
      {
        auth: {
          username: SPLUNK_USERNAME,
          password: SPLUNK_PASSWORD
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent: agent,
        timeout: 10000
      } as any
    );

    const jobId = jobResponse.data.sid;
    if (!jobId) {
      console.error("Error: No job ID returned from Splunk");
      res.status(500).json({ error: 'Failed to create search job' });
      return;
    }

    const resultResponse = await axios.get<any>(
      `${process.env.SPLUNK_URL}/services/search/jobs/${jobId}/results?output_mode=json`,
      {
        auth: {
          username: SPLUNK_USERNAME,
          password: SPLUNK_PASSWORD
        },
        headers: {
          'Content-Type': 'application/json',
        },
        httpsAgent: agent,
        timeout: 10000
      } as any
    );

    const rawLogs = resultResponse.data.results || [];

    const formattedLogs = rawLogs.map((log: { _raw: string }) => {
      try {
        return JSON.parse(log._raw);
      } catch (error) {
        console.error("Error parsing _raw log:", log._raw);
        return { error: "invalid log format", raw: log._raw };
      }
    }).sort((a: LogObject, b: LogObject) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

    // filtering by ROLE
    let filteredLogs = formattedLogs;

    if (role === "restricted") {
      filteredLogs = formattedLogs.filter(
        (log: LogObject) => !restrictedUserBlockedServices.includes(log.serviceName)
      );
    }

    console.log("Final Logs:", filteredLogs);
    res.status(200).json({ logs: filteredLogs });

  } catch (error: any) {
    console.error("Error retrieving logs:", error.message);
    res.status(500).json({ error: error.message });
  }
};

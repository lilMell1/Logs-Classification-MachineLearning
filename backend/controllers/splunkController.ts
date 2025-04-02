import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

interface LogObject {
    serviceName: string;
    timestamp: string;
    logLevel:string;
    logString: string;
    itemId: number;
    source:string;
  }
  
// Force TLS 1.2 and bypass self-signed certificate errors
const agent = new https.Agent({
    rejectUnauthorized: false, // Allow self-signed certs (ONLY for development)
    secureProtocol: 'TLSv1_2_method' // Force TLS 1.2
});

const SPLUNK_USERNAME = process.env.SPLUNK_USERNAME as string;
const SPLUNK_PASSWORD = process.env.SPLUNK_PASSWORD as string;
const SPLUNK_URL = `${process.env.SPLUNK_URL}/services/search/jobs`;

export const searchLogs = async (req: Request, res: Response): Promise<void> => {
    console.log("🔹 searchLogs function triggered");
    console.log("reahced1")

    
    const { selectedProcess, startTime, endTime } = req.body;
    if (!selectedProcess) {
        res.status(400).json({ error: 'Process parameter is required' });
        return;
    }

    // Construct the query with the process and itemId range
    let query = `search index=${selectedProcess} sourcetype=_json`;
    console.log("reahced2")
    
    try {
        const params = new URLSearchParams();
        params.append('search', query);
        params.append('exec_mode', 'blocking');
        params.append('output_mode', 'json'); 
        if (startTime) 
        params.append('earliest_time', startTime);
        if (endTime) 
        params.append('latest_time', endTime);
        console.log("reahced3")
        // console.log("Query being sent:", query);
        // console.log("Start:", startTime);
        // console.log("End:", endTime);
        // console.log("Params:", params.toString());
        
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
        console.log("reahced5")

        if (!jobId) {
            console.error("Error: No job ID returned from Splunk");
            res.status(500).json({ error: 'Failed to create search job' });
            return;
        }
        console.log("reahced6")

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
        console.log("reahced7")

        const rawLogs = resultResponse.data.results || [];

        const formattedLogs = rawLogs.map((log: { _raw: string }) => {
            try {
                const parsedLog = JSON.parse(log._raw);
                return parsedLog;
            } catch (error) {
                console.error(" error parsing _raw log:", log._raw);
                return { error: "invalid log format", raw: log._raw };
            }
        }).sort((a: LogObject, b: LogObject) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeA - timeB;
        });

        console.log("Final Logs:", formattedLogs);
        res.status(200).json({ logs: formattedLogs });        
    } catch (error: any) {
        console.error(" Error retrieving logs:", error.message);
        res.status(500).json({ error: error.message });
    }
};


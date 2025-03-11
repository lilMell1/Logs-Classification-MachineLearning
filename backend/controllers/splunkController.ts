import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

// Force TLS 1.2 and bypass self-signed certificate errors
const agent = new https.Agent({
    rejectUnauthorized: false, // Allow self-signed certs (ONLY for development)
    secureProtocol: 'TLSv1_2_method' // Force TLS 1.2
});

const SPLUNK_USERNAME = process.env.SPLUNK_USERNAME as string;
const SPLUNK_PASSWORD = process.env.SPLUNK_PASSWORD as string;
const SPLUNK_URL = `${process.env.SPLUNK_URL}/services/search/jobs`;

export const getLogById = async (req: Request, res: Response): Promise<void> => {
    console.log("🔹 getLogById function triggered");

    const { id } = req.body;
    if (!id) {
        res.status(400).json({ error: 'ID parameter is required' });
        return;
    }

    // fetch log only the info i need, its in the raw
    const query = `search index=PROJECT_INDEX sourcetype=_json itemId=${id} | table _raw`;

    try {
        // console.log("🔹 Step 1: Sending search request to Splunk...");

        const params = new URLSearchParams();
        params.append('search', query);
        params.append('exec_mode', 'blocking');
        params.append('output_mode', 'json'); 

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

        // console.log("✅ Step 2: Search job created", jobResponse.data);

        const jobId = jobResponse.data.sid; 

        if (!jobId) {
            console.error("Error: No job ID returned from Splunk");
            res.status(500).json({ error: 'Failed to create search job' });
            return;
        }

        // console.log(`🔹 Step 3: Retrieving search results for Job ID: ${jobId}`);

        const resultResponse = await axios.get<any>(
            `${process.env.SPLUNK_URL}/services/search/jobs/${jobId}/results?output_mode=json`, // ✅ Force JSON output
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
                const parsedLog = JSON.parse(log._raw); 
                return parsedLog;
            } catch (error) {
                console.error(" error parsing _raw log:", log._raw);
                return { error: "invalid log format", raw: log._raw };
            }
        });
        
        console.log("Final Logs:", formattedLogs);
        res.status(200).json({ logs: formattedLogs });        
    } catch (error: any) {
        console.error(" Error retrieving logs:", error.message);
        res.status(500).json({ error: error.message });
    }
};

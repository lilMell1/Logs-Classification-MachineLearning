import { Request, Response } from 'express';
import axios from 'axios';

const PYTHON_API_URL = process.env.PYTHON_API_URL as string;

interface LogObject {
  serviceName: string;
  timestamp: string;
  logLevel:string;
  logString: string;
  itemId: number;
  source:string;
}

export const sendToMachine = async (req: Request, res: Response): Promise<void> => {
    try {
        const logs: LogObject[] = req.body.logs;
        console.log(logs);

        if (!logs) {
            res.status(400).json({ error: "No logs provided." });
            return;
        }

        // Filter only problematic logs (debug, trace, warning, fatal)
        const filteredLogs = logs.filter(log => 
            ['debug', 'trace', 'warning', 'fatal'].includes(log.logLevel.toLowerCase())
        );

        if (filteredLogs.length === 0) {
             res.status(200).json({ status: "success", message: "No problematic logs found." });
             return;
        }

        const response = await axios.post(`${PYTHON_API_URL}/analyze-log`, { logs: filteredLogs });
        res.json(response.data);  // Returning the response from the model

    } catch (error) {
        console.error("Error sending logs to ML server:", error);
        res.status(500).json({ error: "Failed to send logs to ML server" });
    }
};

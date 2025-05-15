import { Request, Response } from 'express';
import axios from 'axios';
import { getUserId } from '../middleware/getUserId';
import { MachineResults } from '../models/machineResultsModel';
import { encrypt } from '../utils/encryptionUtil';

const PYTHON_API_URL = process.env.PYTHON_API_URL as string;
const SERVER_INTERNAL_URL = process.env.SERVER_INTERNAL_URL 

interface LogObject {
  serviceName: string;
  timestamp: string;
  logLevel: string;
  logString: string;
  itemId: number;
  source: string;
}

interface PythonResponse {
  results: any[];
  machineSummary: any;
  status?: string;
}

export const analyzeLogsTogether = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs: LogObject[] = req.body.logs;

    if (!logs || logs.length === 0) {
      res.status(400).json({ error: "No logs provided." });
      return;
    }

    const userId = getUserId(req);

    // Filter logs for ML analysis
    const filteredLogs = logs.filter(log =>
      ['debug', 'trace', 'warning', 'fatal'].includes(log.logLevel.toLowerCase())
    );

    let mlResponseData: PythonResponse = {
      machineSummary: null,
      results: []
    };

    if (filteredLogs.length > 0) {
      const mlResponse = await axios.post<PythonResponse>(
        `${PYTHON_API_URL}/analyze-log`,
        { logs: filteredLogs }
      );

      mlResponseData = mlResponse.data;

      await MachineResults.create({
        user: userId,
        results: mlResponseData.results,
        stats: mlResponseData.machineSummary,
      });
    }

    // Reuse existing statistical logic via internal API
    const statsResponse = await axios.post(`${SERVER_INTERNAL_URL}/stats/analyze-logs`, {
      logs
    }, {
      headers: {
        Authorization: req.headers.authorization || "",
      }
    });
    
     const payload = {
      machine: mlResponseData,
      stats: statsResponse.data
    };

    const encrypted = encrypt(JSON.stringify({ str: payload }));

    res.status(200).json({ encrypted });

  } catch (error: any) {
    console.error("Combined analysis failed:", error.message || error);
    res.status(500).json({ error: "Failed to perform combined analysis." });
  }
};

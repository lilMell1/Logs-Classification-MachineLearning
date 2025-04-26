import { Request, Response } from 'express';
import axios from 'axios';
import { getUserId } from '../middleware/getUserId';
import { MachineResults } from '../models/machineResultsModel';

const PYTHON_API_URL = process.env.PYTHON_API_URL as string;

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
  status: string;
}
  

export const sendToMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs: LogObject[] = req.body.logs;
    console.log('Received logs:', logs);

    if (!logs || logs.length === 0) {
      res.status(400).json({ error: "No logs provided." });
      return;
    }

    const filteredLogs = logs.filter(log =>
      ['debug', 'trace', 'warning', 'fatal'].includes(log.logLevel.toLowerCase())
    );

    if (filteredLogs.length === 0) {
      res.status(200).json({ status: "success", message: "No problematic logs found." });
      return;
    }

    const pythonResponse = await axios.post<PythonResponse>(`${PYTHON_API_URL}/analyze-log`, { logs: filteredLogs });

    console.log('Response from Python server:', pythonResponse.data);
    
    if (!pythonResponse.data.results || !pythonResponse.data.machineSummary) {
      console.error('Invalid response from Python server:', pythonResponse.data);
      res.status(500).json({ error: "Invalid response from ML server." });
      return;
    }
    
    const userId = getUserId(req);
    console.log('User ID:', userId);
    
    await MachineResults.create({
      user: userId,
      results: pythonResponse.data.results,
      stats: pythonResponse.data.machineSummary,
    });
    
    res.json({
      machineSummary: pythonResponse.data.machineSummary,
      results: pythonResponse.data.results,
    });
    
  } catch (error) {
    console.error("Error sending logs to ML server:", error);
    res.status(500).json({ error: "Failed to send logs to ML server." });
  }
};



// machineController.ts
export const getLatestMachineResult = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = getUserId(req);
      const latestResult = await MachineResults.findOne({ user: userId }).sort({ createdAt: -1 });
  
      if (!latestResult) {
        console.log('No machine results found for user:', userId);
        res.status(200).json(null);  // 👈 מחזירים 200 ריק במקום 404
        return;
      }
  
      res.status(200).json({
        machineSummary: latestResult.stats,
        results: latestResult.results,
      });
    } catch (error) {
      console.error("Failed to fetch latest machine result:", error);
      res.status(500).json({ error: "Failed to fetch latest machine result." });
    }
  };
  
  
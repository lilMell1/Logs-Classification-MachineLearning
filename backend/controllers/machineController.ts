import { Request, Response } from 'express';
import axios from 'axios';

const PYTHON_API_URL = process.env.PYTHON_API_URL as string;
// console.log("PROBLEM!:"+PYTHON_API_URL)
export const sendToMachine = async (req: Request, res: Response): Promise<void> => {
    try {
        const logs = req.body.logs;
        console.log(logs);
        if (!logs) {
           res.status(400).json({ error: "No logs provided." });
           return;
        }
    
        const response = await axios.post(`${PYTHON_API_URL}/analyze-log`, { logs });
        res.json(response.data);
      } catch (error) {
        console.error("Error sending logs to ML server:", error);
        res.status(500).json({ error: "Failed to send logs to ML server" });
      }
};
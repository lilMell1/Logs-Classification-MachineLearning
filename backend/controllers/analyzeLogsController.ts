import { Request, Response } from 'express';
import { LatestAnalysis, CumulativeAnalysis } from '../models/logAnalysisModel';

// Controller to analyze logs
export const analyzeLogsController = async (req: Request, res: Response): Promise<void> => {
  const logs = req.body.logs;

  // Step 1: Check if logs were provided
  if (!logs || logs.length === 0) {
    res.status(400).json({ message: 'No logs provided.' });
    return;
  }

  // Step 2: Sort logs by timestamp
  const sortedLogs = logs.sort((a: any, b: any) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const start = new Date(sortedLogs[0].timestamp);
  const end = new Date(sortedLogs[sortedLogs.length - 1].timestamp);
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

  // Step 3: Calculate error distribution by log level
  const logLevels = ['info', 'debug', 'warning', 'error', 'fatal'];
  const errorDist: Record<string, number> = {};

  for (const level of logLevels) errorDist[level] = 0;

  logs.forEach((log: any) => {
    const level = log.logLevel?.toLowerCase() || 'unknown';
    if (!errorDist[level]) errorDist[level] = 0;
    errorDist[level]++;
  });

  // Step 4: Calculate service durations
  const serviceDurationsMap: Record<string, number[]> = {};

  // Group logs by service and calculate time gaps
  sortedLogs.forEach((log: any, index: number) => {
    const { serviceName, timestamp } = log;
    if (!serviceDurationsMap[serviceName]) {
      serviceDurationsMap[serviceName] = [];
    }

    const prevIndex = sortedLogs.slice(0, index).reverse().findIndex(
      (l: any) => l.serviceName === serviceName
    );

    if (prevIndex !== -1) {
      const prevLog = sortedLogs[index - prevIndex - 1];
      const gap = (new Date(timestamp).getTime() - new Date(prevLog.timestamp).getTime()) / 1000;
      serviceDurationsMap[serviceName].push(gap);
    }
  });

  // Calculate average time for each service
  const serviceDurations = Object.entries(serviceDurationsMap).map(([name, gaps]) => {
    const sum = gaps.reduce((a, b) => a + b, 0);
    const avg = gaps.length > 0 ? sum / gaps.length : 0;

    return {
      serviceName: name,
      durationSeconds: avg,
    };
  });
  
  try {
    // Step 5: Save latest analysis
    await LatestAnalysis.create({
      totalLogs: logs.length,
      averageDurationMinutes: durationMinutes,
      errorDistribution: errorDist,
      serviceDurations,
      type: 'latest'
    });

    // Step 6: Update cumulative analysis
    let cumulative = await CumulativeAnalysis.findOne();

    if (!cumulative) {
      await CumulativeAnalysis.create({
        totalLogs: logs.length,
        averageDurationMinutes: durationMinutes,
        errorDistribution: errorDist,
        serviceDurations,
        type: 'cumulative'
      });
    } else {
      const totalLogsBefore = cumulative.totalLogs;
      const totalLogsAfter = totalLogsBefore + logs.length;

      // Calculate weighted average of duration
      cumulative.averageDurationMinutes =
        ((cumulative.averageDurationMinutes * totalLogsBefore) + (durationMinutes * logs.length)) / totalLogsAfter;

      cumulative.totalLogs = totalLogsAfter;

      // Sum all error distribution
      for (const [key, value] of Object.entries(errorDist)) {
        cumulative.errorDistribution[key] = (cumulative.errorDistribution[key] || 0) + value;
      }

      // Weighted average for each service
      for (const newService of serviceDurations) {
        const existing = cumulative.serviceDurations.find(
          (s) => s.serviceName === newService.serviceName
        );

        if (existing) {
          existing.durationSeconds =
            ((existing.durationSeconds * totalLogsBefore) + (newService.durationSeconds * logs.length)) / totalLogsAfter;
        } else {
          cumulative.serviceDurations.push(newService);
        }
      }

      cumulative.markModified('errorDistribution');
      cumulative.markModified('serviceDurations');

      await cumulative.save();
    }

    // Step 7: Send response with analyzed data
    res.json({
      totalLogs: logs.length,
      averageDurationMinutes: durationMinutes,
      errorDistribution: errorDist,
      serviceDurations,
    });

  } catch (error) {
    console.error('Analysis failed:', error);
    res.status(500).json({ message: 'Failed to analyze logs' });
  }
};

// Fetch latest analysis
export const getLatestAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const latest = await LatestAnalysis.findOne().sort({ createdAt: -1 });
    if (!latest) {
      res.status(404).json({ message: 'No latest analysis found' });
      return;
    }
    res.json(latest);
  } catch (error) {
    console.error('Fetching latest failed:', error);
    res.status(500).json({ message: 'Failed to fetch latest analysis' });
  }
};

// Fetch cumulative analysis
export const getCumulativeAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const cumulative = await CumulativeAnalysis.findOne();
    if (!cumulative) {
      res.status(404).json({ message: 'No cumulative analysis found' });
      return;
    }
    res.json(cumulative);
  } catch (error) {
    console.error('Fetching cumulative failed:', error);
    res.status(500).json({ message: 'Failed to fetch cumulative analysis' });
  }
};

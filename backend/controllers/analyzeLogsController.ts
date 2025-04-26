import { Request, Response } from 'express';
import { LatestAnalysis, CumulativeAnalysis } from '../models/logAnalysisModel';
import { getUserId } from '../middleware/getUserId'; 

// Controller to analyze logs
export const analyzeLogsController = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  const logs = req.body.logs;

  if (!logs || logs.length === 0) {
    res.status(400).json({ message: 'No logs provided.' });
    return;
  }

  const sortedLogs = logs.sort((a: any, b: any) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const start = new Date(sortedLogs[0].timestamp);
  const end = new Date(sortedLogs[sortedLogs.length - 1].timestamp);
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

  const logLevels = ['info', 'debug', 'warning', 'error', 'fatal'];
  const errorDist: Record<string, number> = {};

  for (const level of logLevels) errorDist[level] = 0;

  logs.forEach((log: any) => {
    const level = log.logLevel?.toLowerCase() || 'unknown';
    if (!errorDist[level]) errorDist[level] = 0;
    errorDist[level]++;
  });

  const serviceDurationsMap: Record<string, number[]> = {};

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

  const serviceDurations = Object.entries(serviceDurationsMap).map(([name, gaps]) => {
    const sum = gaps.reduce((a, b) => a + b, 0);
    const avg = gaps.length > 0 ? sum / gaps.length : 0;

    return {
      serviceName: name,
      durationSeconds: avg,
    };
  });

  try {
    // ⬇️ קודם מנסה למצוא את ה-LatestAnalysis של היוזר
    let latest = await LatestAnalysis.findOne({ user: userId });

    if (!latest) {
      await LatestAnalysis.create({
        user: userId,
        totalLogs: logs.length,
        averageDurationMinutes: durationMinutes,
        errorDistribution: errorDist,
        serviceDurations,
        type: 'latest'
      });
    } else {
      latest.totalLogs = logs.length;
      latest.averageDurationMinutes = durationMinutes;
      latest.errorDistribution = errorDist;
      latest.serviceDurations = serviceDurations;
      latest.type = 'latest';
      await latest.save();
    }

    let cumulative = await CumulativeAnalysis.findOne({ user: userId });

    if (!cumulative) {
      await CumulativeAnalysis.create({
        user: userId,
        totalLogs: logs.length,
        averageDurationMinutes: durationMinutes,
        errorDistribution: errorDist,
        serviceDurations,
        type: 'cumulative'
      });
    } else {
      const totalLogsBefore = cumulative.totalLogs;
      const totalLogsAfter = totalLogsBefore + logs.length;

      cumulative.averageDurationMinutes =
        ((cumulative.averageDurationMinutes * totalLogsBefore) + (durationMinutes * logs.length)) / totalLogsAfter;

      cumulative.totalLogs = totalLogsAfter;

      for (const [key, value] of Object.entries(errorDist)) {
        cumulative.errorDistribution[key] = (cumulative.errorDistribution[key] || 0) + value;
      }

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
  const userId = getUserId(req);
  console.log('userId at getLatestAnalysis:', userId);
  try {
    const latest = await LatestAnalysis.findOne({ user: userId }).sort({ createdAt: -1 });
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
  const userId = getUserId(req);
  console.log('userId at getCumulativeAnalysis:', userId);
  try {
    const cumulative = await CumulativeAnalysis.findOne({ user: userId });
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

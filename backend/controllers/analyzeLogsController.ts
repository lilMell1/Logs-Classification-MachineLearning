import { Request, Response } from 'express';
import { LatestAnalysis, CumulativeAnalysis } from '../models/logAnalysisModel';

export const analyzeLogsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = req.body.logs;

    if (!logs || logs.length === 0) {
      res.status(400).json({ message: 'No logs provided.' });
      return;
    }

    // 1. מיון לפי זמן
    const sortedLogs = logs.sort((a: any, b: any) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const start = new Date(sortedLogs[0].timestamp);
    const end = new Date(sortedLogs[sortedLogs.length - 1].timestamp);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    // 2. חישוב התפלגות כל סוגי ה-logLevel
    const logLevels = ['info', 'debug', 'warning', 'error', 'fatal'];
    const errorDist: Record<string, number> = {};

    for (const level of logLevels) errorDist[level] = 0;

    logs.forEach((log: any) => {
      const level = log.logLevel?.toLowerCase() || 'unknown';
      if (!errorDist[level]) errorDist[level] = 0;
      errorDist[level]++;
    });

    // 3. חישוב זמני שירות
    const serviceDurationsMap: Record<string, number[]> = {};

// עבור כל לוג - קבץ לפי שירות
  sortedLogs.forEach((log: any, index: number) => {
    const { serviceName, timestamp } = log;
    if (!serviceDurationsMap[serviceName]) {
      serviceDurationsMap[serviceName] = [];
    }

    const prevIndex = sortedLogs.slice(0, index).reverse().findIndex(
      (l:any) => l.serviceName === serviceName
    );

    if (prevIndex !== -1) {
      const prevLog = sortedLogs[index - prevIndex - 1];
      const gap = (new Date(timestamp).getTime() - new Date(prevLog.timestamp).getTime()) / 1000;
      serviceDurationsMap[serviceName].push(gap);
    }
  });

  // חישוב ממוצע לכל שירות
  const serviceDurations = Object.entries(serviceDurationsMap).map(([name, gaps]) => {
    const sum = gaps.reduce((a, b) => a + b, 0);
    const avg = gaps.length > 0 ? sum / gaps.length : 0;

    return {
      serviceName: name,
      durationSeconds: avg,
    };
  });


    // 4. שמור latest
    await LatestAnalysis.create({
      totalLogs: logs.length,
      averageDurationMinutes: durationMinutes,
      errorDistribution: errorDist,
      serviceDurations,
      type: 'latest'
    });

    // 5. עדכן cumulative
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

      // ממוצע משוקלל של זמן
      cumulative.averageDurationMinutes =
        ((cumulative.averageDurationMinutes * totalLogsBefore) + (durationMinutes * logs.length)) / totalLogsAfter;

      cumulative.totalLogs = totalLogsAfter;

      // סכום כל התפלגות הלוגים
      for (const [key, value] of Object.entries(errorDist)) {
        cumulative.errorDistribution[key] = (cumulative.errorDistribution[key] || 0) + value;
      }

      // ממוצע מצטבר לכל שירות
      for (const newService of serviceDurations) {
        const existing = cumulative.serviceDurations.find(
          (s) => s.serviceName === newService.serviceName
        );

        if (existing) {
          // חישוב ממוצע משוקלל למצטבר
          existing.durationSeconds =
            ((existing.durationSeconds * totalLogsBefore) + (newService.durationSeconds * logs.length)) / totalLogsAfter;
        } else {
          cumulative.serviceDurations.push(newService);
        }
      }

      // חובה אם עובדים עם אובייקטים
      cumulative.markModified('errorDistribution');
      cumulative.markModified('serviceDurations');

      await cumulative.save();
    }

    // שלח תשובה
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

// שאר הפונקציות נשארות זהות:
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

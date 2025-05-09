import { Request, Response } from 'express';
import { LatestAnalysis, CumulativeAnalysis } from '../models/logAnalysisModel';
import { getUserId } from '../middleware/getUserId';
import mongoose from 'mongoose';

// Main analysis endpoint
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

  const errorDist: Record<string, number> = {};
  for (const log of logs) {
    const level = log.logLevel?.toLowerCase() || 'unknown';
    errorDist[level] = (errorDist[level] || 0) + 1;
  }

  const serviceDurationsMap: Record<string, number[]> = {};
  sortedLogs.forEach((log: any, index: number) => {
    const { serviceName, timestamp } = log;
    const prev = sortedLogs.slice(0, index).reverse().find(
      (l: any) => l.serviceName === serviceName
    );
    if (prev) {
      const gap = (new Date(timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000;
      serviceDurationsMap[serviceName] = serviceDurationsMap[serviceName] || [];
      serviceDurationsMap[serviceName].push(gap);
    }
  });

  const serviceDurations = Object.entries(serviceDurationsMap).map(([name, gaps]) => ({
    serviceName: name,
    durationSeconds: gaps.reduce((a, b) => a + b, 0) / gaps.length
  }));

  await LatestAnalysis.create({
    user: userId,
    totalLogs: logs.length,
    averageDurationMinutes: durationMinutes,
    errorDistribution: errorDist,
    serviceDurations,
    type: 'latest'
  });

  await recalculateCumulative(new mongoose.Types.ObjectId(userId));

  res.json({ totalLogs: logs.length, averageDurationMinutes: durationMinutes, errorDistribution: errorDist, serviceDurations });
};

export const deleteLatestAndRecalculate = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);

  const latest = await LatestAnalysis.find({ user: userId }).sort({ createdAt: -1 }).limit(1);
  if (latest.length === 0) {
    res.status(404).json({ message: 'No latest analysis to delete.' });
    return;
  }

  await LatestAnalysis.findByIdAndDelete(latest[0]._id);
  await recalculateCumulative(new mongoose.Types.ObjectId(userId));

  res.json({ message: 'Deleted and recalculated.' });
};

export const getLatestAnalysis = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  const latest = await LatestAnalysis.findOne({ user: userId }).sort({ createdAt: -1 });
  if (!latest) {
    res.status(404).json({ message: 'No latest analysis found.' });
    return;
  }
  res.json(latest);
};

export const getCumulativeAnalysis = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  const cumulative = await CumulativeAnalysis.findOne({ user: userId });
  if (!cumulative) {
    res.status(404).json({ message: 'No cumulative analysis found.' });
    return;
  }
  res.json(cumulative);
};

// Utility
const recalculateCumulative = async (userId: mongoose.Types.ObjectId) => {
  const all = await LatestAnalysis.find({ user: userId });

  if (all.length === 0) {
    await CumulativeAnalysis.deleteOne({ user: userId });
    return;
  }

  let totalLogs = 0;
  let totalDuration = 0;
  const errorCombined: Record<string, number> = {};
  const serviceDurMap: Record<string, number[]> = {};

  for (const log of all) {
    totalLogs += log.totalLogs;
    totalDuration += log.averageDurationMinutes * log.totalLogs;

    for (const [key, val] of Object.entries(log.errorDistribution)) {
      errorCombined[key] = (errorCombined[key] || 0) + val;
    }

    for (const { serviceName, durationSeconds } of log.serviceDurations) {
      serviceDurMap[serviceName] = serviceDurMap[serviceName] || [];
      serviceDurMap[serviceName].push(durationSeconds);
    }
  }

  const averageDurationMinutes = totalDuration / totalLogs;
  const serviceDurations = Object.entries(serviceDurMap).map(([name, list]) => ({
    serviceName: name,
    durationSeconds: list.reduce((a, b) => a + b, 0) / list.length
  }));

  await CumulativeAnalysis.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      totalLogs,
      averageDurationMinutes,
      errorDistribution: errorCombined,
      serviceDurations,
      type: 'cumulative',
    },
    { upsert: true }
  );
};

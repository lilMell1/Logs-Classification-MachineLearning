import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceDuration {
  serviceName: string;
  durationSeconds: number;
}

export interface ILogAnalysis extends Document {
  createdAt: Date;
  totalLogs: number;
  averageDurationMinutes: number;
  errorDistribution: Record<string, number>;
  serviceDurations: IServiceDuration[];
  maxTimeGapSeconds?: number;
  serviceWithMostActivity?: string;
  type: 'latest' | 'cumulative';
}

const logAnalysisSchema = new Schema<ILogAnalysis>({
  createdAt: { type: Date, default: Date.now },
  totalLogs: { type: Number, required: true },
  averageDurationMinutes: { type: Number, required: true },
  errorDistribution: { type: Object, required: true },
  serviceDurations: [
    {
      serviceName: { type: String, required: true },
      durationSeconds: { type: Number, required: true },
    }
  ],
  maxTimeGapSeconds: { type: Number, default: 0 },
  serviceWithMostActivity: { type: String, default: '' },
  type: { type: String, enum: ['latest', 'cumulative'], required: true }
});

export const LatestAnalysis = mongoose.model<ILogAnalysis>(
  'LatestAnalysis',
  logAnalysisSchema,
  'latest_analyses'
);

export const CumulativeAnalysis = mongoose.model<ILogAnalysis>(
  'CumulativeAnalysis',
  logAnalysisSchema,
  'cumulative_analyses'
);

import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceDuration {
  serviceName: string;
  durationSeconds: number;
}

export interface ILogAnalysis extends Document {
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  totalLogs: number;
  averageDurationMinutes: number;
  errorDistribution: Record<string, number>;
  serviceDurations: IServiceDuration[];
  maxTimeGapSeconds?: number;
  serviceWithMostActivity?: string;
  type: 'latest' | 'cumulative';
  expiresAt: Date; 
}

const logAnalysisSchema = new Schema<ILogAnalysis>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
  type: { type: String, enum: ['latest', 'cumulative'], required: true },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: { expireAfterSeconds: 0 }
  }
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

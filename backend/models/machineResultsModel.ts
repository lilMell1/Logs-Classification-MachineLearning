import mongoose, { Schema, Document } from 'mongoose';

interface IMachineResult extends Document {
  user: mongoose.Types.ObjectId;
  results: any[];
  stats: any;
  expiresAt: Date; 
}

const machineResultSchema = new Schema<IMachineResult>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  results: [{ type: Schema.Types.Mixed, required: true }],
  stats: { type: Object, required: true },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 mounth
  },
}, { timestamps: true });

export const MachineResults = mongoose.model<IMachineResult>('MachineResults', machineResultSchema);

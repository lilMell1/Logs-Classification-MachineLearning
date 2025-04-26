import mongoose, { Schema, Document } from 'mongoose';

interface IMachineResult extends Document {
  user: mongoose.Types.ObjectId;
  results: any[];
  stats: any;
}

const machineResultSchema = new Schema<IMachineResult>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  results: [{ type: Schema.Types.Mixed, required: true }],
  stats: { type: Object, required: true },
}, { timestamps: true });

export const MachineResults = mongoose.model<IMachineResult>('MachineResults', machineResultSchema);

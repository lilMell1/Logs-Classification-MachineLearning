import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    createdAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // UTC+2
      expires: '3d',
    }, 
   },
  { collection: 'blacklist' } 
);

export default mongoose.model('Blacklist', blacklistSchema);

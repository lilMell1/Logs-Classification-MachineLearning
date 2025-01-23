import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically sets the current time
    },
  },
  { collection: 'blacklist' }
);

const Blacklist = mongoose.model('Blacklist', blacklistSchema);

// Programmatically create the TTL index
Blacklist.collection.createIndex(
  { createdAt: 1 }, 
  { expireAfterSeconds: 259200 } 
);

export default Blacklist;

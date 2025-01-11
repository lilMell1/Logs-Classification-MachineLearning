import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';

import dotenv from 'dotenv';
dotenv.config();  

const app = express();
const DATABASE_URL = process.env.DATABASE_URL as string;
const PORT = process.env.PORT as string;
app.use(express.json());
app.use(cors({ 
  origin: 'http://localhost:3000',  
  credentials: true,               
}));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(DATABASE_URL, {
}).then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Failed to connect to MongoDB:', error));

// Use Routes
app.use('/api', authRoutes);  // login, register, logout


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
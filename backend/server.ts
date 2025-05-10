import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';
import splunkRoutes from './routes/splunkRoutes';
import pythonRoutes from './routes/pythonRoutes';
import statsRoutes from './routes/statsRoutes';
import userRoutes from './routes/userRoutes'
import adminRoutes from './routes/adminRoutes';
import analyzeBothRouter from './routes/analyzeBothRouter';

import dotenv from 'dotenv';
dotenv.config();  

const app = express();
const DATABASE_URL = process.env.DATABASE_URL as string;
const PORT = process.env.JS_PORT as string;
app.use(express.json());
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:8088','http://localhost:5000'],  
  credentials: true,               
}));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(DATABASE_URL, {
}).then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Failed to connect to MongoDB:', error));

// Use Routes
app.use('/api', authRoutes);  
app.use('/splunk', splunkRoutes);
app.use('/pythonApi', pythonRoutes);
app.use('/stats', statsRoutes);
app.use('/userApi', userRoutes);
app.use('/adminApi', adminRoutes);
app.use('/logs', analyzeBothRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
     res.status(401).json({ message: 'No token provided' });
     return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error('ACCESS_TOKEN_SECRET not defined');
  }

  try {
    const decoded: any = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
       res.status(401).json({ message: 'User not found or deleted' });
      return;
    }

    (req as any).user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
     res.status(401).json({ message: 'Invalid or expired token' });
     return;
  }
};

export default authenticate;

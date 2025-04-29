import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel';

export const changeUsername = async (req: Request, res: Response):Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error('ACCESS_TOKEN_SECRET not defined');
    }

    if (!token) {
       res.status(401).json({ message: 'No token provided' });
       return;
    }

    const decoded: any = jwt.verify(token, secret);
    const userId = decoded.id;

    const { newUsername } = req.body;

    await UserModel.findByIdAndUpdate(userId, { username: newUsername });

    res.status(200).json({ message: 'Username updated successfully' });
  } catch (err) {
    console.error('Error in changeUsername:', err);
    res.status(401).json({ message: 'Invalid token or update failed' });
  }
};

export const deleteUser = async (req: Request, res: Response):Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error('ACCESS_TOKEN_SECRET not defined');
    }

    if (!token) {
       res.status(401).json({ message: 'No token provided' });
       return;
    }

    const decoded: any = jwt.verify(token, secret);
    const userId = decoded.id;

    await UserModel.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(401).json({ message: 'Invalid token or deletion failed' });
  }
};


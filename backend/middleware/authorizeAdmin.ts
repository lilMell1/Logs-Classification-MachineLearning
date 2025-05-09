import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/userModel';

//Fetches the user role from the database so XSS wont work.
export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
       res.status(401).json({ message: "User ID missing from token." });
       return;
    }

    const user = await UserModel.findById(userId);

    if (!user) {
       res.status(404).json({ message: "User not found." });
       return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ message: "Access denied. Admins only." });
      return;
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

import { Request, Response } from "express";
import User from "../models/userModel";

const isAdmin = (user: any) => user?.role === "admin";

export const getAllUsers = async (req: any, res: Response): Promise<void> => {
  if (!isAdmin(req.user)) {
     res.status(403).json({ message: "Access denied" });
     return;
  }

  try {
    const users = await User.find({}, "username email role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserRole = async (req: any, res: Response): Promise<void> => {
  if (!isAdmin(req.user)) {
     res.status(403).json({ message: "Access denied" });
     return;
  }

  const { id } = req.params;
  const { role } = req.body;

  if (!["admin", "user", "restricted"].includes(role)) {
     res.status(400).json({ message: "Invalid role" });
     return;
  }

  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user){
        res.status(404).json({ message: "User not found" });
        return;
    } 
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

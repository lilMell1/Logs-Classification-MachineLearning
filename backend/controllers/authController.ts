import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import UserModel, { IUser } from '../models/userModel';
import BlacklistModel from '../models/blacklistModel';

dotenv.config();

// Secrets and salt
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const SALT_ROUNDS = 10; //should randomize later!

// Generate Access and Refresh Tokens
const generateTokens = (user: IUser) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: '1d' }
  );

  return { accessToken, refreshToken };
};

// Register User
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, username } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Login User
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      username: user.username,  
      userId: user._id           
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Refresh Token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { accessToken, refreshToken } = req.body;

  // Step 1: Check if refresh token is provided
  if (!refreshToken) {
    res.status(401).json({ message: 'Refresh token is required.' });
    return;
  }

  // Step 2: Check if access token is still valid
  if (accessToken) {
    const decoded = jwt.decode(accessToken) as { exp: number } | null;
    if (decoded && decoded.exp * 1000 > Date.now()) {
      res.status(200).json({ accessToken }); // Token is still valid
      return;
    }
  }

  // Step 3: Decode and check refresh token expiration
  const decodedRefresh = jwt.decode(refreshToken) as { exp: number } | null;
  if (!decodedRefresh || decodedRefresh.exp * 1000 < Date.now()) {
    res.status(401).json({ message: 'Refresh token has expired.' });
    return;
  }

  // Step 4: Check if refresh token is blacklisted
  const blacklisted = await BlacklistModel.findOne({ token: refreshToken });
  if (blacklisted) {
    res.status(403).json({ message: 'Refresh token is blacklisted.' });
    return;
  }

  // Step 5: Verify and validate refresh token
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
    const user = await UserModel.findById(decoded.id);

    // Step 6: Ensure user exists
    if (!user) {
      res.status(403).json({ message: 'Invalid refresh token.' });
      return;
    }

    // Step 7: Generate new access token
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Invalid refresh token.' });
  }
};


// Logout User
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  // Validate input
  if (!refreshToken) {
    res.status(400).json({ message: 'Refresh token is required.' });
    return;
  }

  try {
    // Insert refresh token into the blacklist collection
    const blacklistedToken = new BlacklistModel({ token: refreshToken });
    await blacklistedToken.save(); // Save the token in MongoDB

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


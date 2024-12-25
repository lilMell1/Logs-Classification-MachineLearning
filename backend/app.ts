import express, { Application, Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

// Create Express app
const app: Application = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running with TypeScript!');
});

// Error handling for 404
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.send('error');
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;

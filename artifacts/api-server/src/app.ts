import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

import apiRouter from './routes/index.js';

// Routes
app.use('/api', apiRouter);

// Health check fallback
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Mustashar API is running' });
});

export default app;

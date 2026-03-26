import express, { Request, Response } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './lib/logger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    res.json({ message: 'Login endpoint', email });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    res.json({ message: 'Register endpoint', email, name });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;

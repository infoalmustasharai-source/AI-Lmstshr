import express from 'express';

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/login', (req, res) => {
  res.json({ message: 'Login endpoint working', email: req.body.email });
});

app.post('/api/register', (req, res) => {
  res.json({ message: 'Register endpoint working', email: req.body.email });
});

export default app;

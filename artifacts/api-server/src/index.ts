import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  res.json({ 
    success: true, 
    message: 'Login successful',
    token: 'fake-jwt-token',
    user: { email, name: 'User' }
  });
});

app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;
  res.json({ 
    success: true, 
    message: 'Registration successful',
    token: 'fake-jwt-token',
    user: { email, name }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const express require('express'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.post('/api/login', (req, res) => {
  res.json({ success: true, message: 'Login successful', token: 'fake-token' })
})

app.post('/api/register', (req, res) => {
  res.json({ success: true, message: 'Registration successful' })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    time: new Date().toISOString()
  });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});


app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});


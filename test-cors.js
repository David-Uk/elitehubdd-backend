// Test CORS configuration
const cors = require('cors');
const express = require('express');

const app = express();

// Use the same CORS configuration as the main app
const corsConfig = cors({
  origin: '*', // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
});

app.use(corsConfig);

app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    allowed: 'All origins allowed',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`CORS test server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test-cors`);
  console.log('CORS is configured to allow all origins (*)');
});

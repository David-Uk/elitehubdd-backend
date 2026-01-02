import express from 'express';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();
app.use(express.json());

// Mock middleware to avoid auth issues
app.use((req, res, next) => {
  req.user = { id: 1, role: 'admin' };
  next();
});

app.use('/api/dashboard', dashboardRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  
  // Test the route
  fetch(`http://localhost:${PORT}/api/dashboard/stats`)
    .then(res => res.json())
    .then(data => console.log('Route test result:', data))
    .catch(err => console.error('Route test error:', err));
});

import express from 'express';
import { clearAllData, getDataSummary } from '../controllers/dataClearController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get data summary before clearing (requires admin role)
router.get('/summary', 
  authenticateToken, 
  requireRole(['admin', 'super_admin']), 
  getDataSummary
);

// Clear all data except User and Staff models (requires super_admin role only)
router.delete('/clear-all', 
  authenticateToken, 
  requireRole(['super_admin']), 
  clearAllData
);

export default router;

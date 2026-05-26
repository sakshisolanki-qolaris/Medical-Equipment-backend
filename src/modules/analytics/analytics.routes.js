import express from 'express';
import { fetchDashboardMetrics, fetchLedger } from './analytics.controller.js';
import { verifyToken, authorizeRoles } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Fetch general dashboard metrics
router.get('/dashboard', 
  verifyToken, 
  authorizeRoles('Admin', 'Staff'), 
  fetchDashboardMetrics
);


router.get('/ledger', verifyToken, authorizeRoles('Admin'), fetchLedger);

export default router;
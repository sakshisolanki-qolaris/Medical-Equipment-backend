import express from 'express';
import { allocateEquipment, fetchAllocations } from './allocation.controller.js';
import { validateAllocation } from './allocation.validator.js';
import { verifyToken, authorizeRoles } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Route to allocate equipment
router.post('/checkout', 
  verifyToken, 
  authorizeRoles('Admin', 'Staff'), 
  validateAllocation, 
  allocateEquipment
);


router.get('/', verifyToken, authorizeRoles('Admin', 'Staff'), fetchAllocations);

export default router;
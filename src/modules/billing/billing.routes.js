import express from 'express';
import { processReturn, downloadInvoice } from './billing.controller.js';
import { validateProcessReturn } from './billing.validator.js';
import { verifyToken, authorizeRoles } from '../../middlewares/auth.middleware.js';

const router = express.Router();


router.post('/return/:id', 
  verifyToken, 
  authorizeRoles('Admin', 'Staff'), 
  validateProcessReturn, 
  processReturn
);


router.get('/invoice/:id', verifyToken, authorizeRoles('Admin', 'Staff', 'Viewer'), downloadInvoice);

export default router;
import express from 'express';
import { addEquipment, deleteEquipment, updatePricing, fetchAvailableEquipment, fetchAdminCategories, // NEW
  removeCategory } from './inventory.controller.js';
import { validateAddEquipment, validateUpdatePricing } from './inventory.validator.js';
import { verifyToken, authorizeRoles } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Inventory CRUD (Admins and Staff can manage)
router.get('/available', verifyToken, authorizeRoles('Admin', 'Staff', 'Viewer'), fetchAvailableEquipment);

// Admin Stock Report (Admin ONLY) - Shows ALL categories, including empty ones
router.get('/admin/categories', verifyToken, authorizeRoles('Admin','Staff'), fetchAdminCategories);


// Add physical equipment (Admin, Staff)
router.post('/add', verifyToken, authorizeRoles('Admin', 'Staff'), validateAddEquipment, addEquipment);

// Delete Category (Admin ONLY)
router.delete('/category/:id', verifyToken, authorizeRoles('Admin'), removeCategory);

// Update Pricing (Admin ONLY)
router.patch('/category/:id/pricing', verifyToken, authorizeRoles('Admin'), validateUpdatePricing, updatePricing);

// Delete physical equipment (Admin, Staff)
// Keep this at the bottom so it doesn't accidentally catch '/category/...'
router.delete('/:id', verifyToken, authorizeRoles('Admin', 'Staff'), deleteEquipment);

export default router;
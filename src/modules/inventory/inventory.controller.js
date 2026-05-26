import * as InventoryService from './inventory.service.js';

export const addEquipment = async (req, res) => {
  try {
    const newEquipment = await InventoryService.registerEquipment(req.body);
    res.status(201).json({ message: 'Equipment Registered', data: newEquipment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    const result = await InventoryService.removeEquipment(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePricing = async (req, res) => {
  try {
    const updatedCategory = await InventoryService.adjustPricing(req.params.id, req.body);
    res.status(200).json({ message: 'Pricing updated successfully', data: updatedCategory });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const fetchAvailableEquipment = async (req, res) => {
  try {
    const inventoryData = await InventoryService.getAvailableInventory();
    
    return res.status(200).json({
      message: 'Available inventory fetched successfully',
      data: inventoryData
    });
  } catch (error) {
    console.error('Fetch Inventory Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const fetchAdminCategories = async (req, res) => {
  try {
    const report = await InventoryService.getAdminCategoryReport();
    return res.status(200).json({
      message: 'Admin stock report fetched successfully',
      data: report
    });
  } catch (error) {
    console.error('Fetch Admin Categories Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeCategory = async (req, res) => {
  try {
    const result = await InventoryService.removeCategory(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('Cannot delete category')) {
      return res.status(409).json({ error: error.message }); 
    }
    console.error('Delete Category Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
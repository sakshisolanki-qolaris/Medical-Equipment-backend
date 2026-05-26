import * as InventoryRepo from './inventory.repository.js';

export const registerEquipment = async (payload) => {
  const exists = await InventoryRepo.findEquipmentBySerial(payload.equipment_id);
  if (exists) throw new Error('Equipment with this ID already exists.');

  const category = await InventoryRepo.findCategoryById(payload.category_id);
  if (!category) throw new Error('Invalid pricing category.');

  return await InventoryRepo.createEquipment(payload);
};

export const removeEquipment = async (id) => {
  const equipment = await InventoryRepo.findEquipmentById(id);
  if (!equipment) throw new Error('Equipment not found.');
  
  if (equipment.status === 'Allotted') {
    throw new Error('Cannot delete equipment that is currently allotted.');
  }

  await InventoryRepo.deleteEquipment(id);
  return { message: 'Equipment successfully soft-deleted.' };
};

export const adjustPricing = async (categoryId, payload) => {
  const category = await InventoryRepo.findCategoryById(categoryId);
  if (!category) throw new Error('Category not found.');

  await InventoryRepo.updateCategory(categoryId, payload);
  return await InventoryRepo.findCategoryById(categoryId); // Return updated data
};


export const getAvailableInventory = async () => {
  const availableItems = await InventoryRepo.findAllAvailableEquipment();

  // Optional: Transform the flat array into a grouped summary for the Viewer Dashboard
  const dashboardSummary = availableItems.reduce((acc, item) => {
    const categoryName = item.EquipmentCategory.name_en;
    
    if (!acc[categoryName]) {
      acc[categoryName] = {
        name_hi: item.EquipmentCategory.name_hi,
        name_en: categoryName,
        deposit_amount: item.EquipmentCategory.deposit_amount,
        daily_rent: item.EquipmentCategory.daily_rent,
        available_count: 0,
        items: []
      };
    }
    
    acc[categoryName].available_count += 1;
    acc[categoryName].items.push(item.equipment_id);
    
    return acc;
  }, {});

  return {
    total_available: availableItems.length,
    summary: Object.values(dashboardSummary)
  };
};


export const getAdminCategoryReport = async () => {
  const categories = await InventoryRepo.findAllCategoriesWithStock();

  // Transform the data to give the Admin a clear count of stock
  const report = categories.map(category => {
    const items = category.Equipment || [];
    const totalStock = items.length;
    const availableStock = items.filter(item => item.status === 'Available').length;
    const allottedStock = items.filter(item => item.status === 'Allotted').length;

    return {
      id: category.id,
      name_hi: category.name_hi,
      name_en: category.name_en,
      deposit_amount: category.deposit_amount,
      daily_rent: category.daily_rent,
      stock_summary: {
        total: totalStock,
        available: availableStock,
        allotted: allottedStock,
        needs_restock: availableStock === 0 // Helpful flag for the frontend
      }
    };
  });

  return report;
};

export const removeCategory = async (categoryId) => {
  // 1. Ensure the category actually exists
  const category = await InventoryRepo.findCategoryById(categoryId);
  if (!category) {
    throw new Error('Category not found.');
  }

  // 2. Strict Safety Check: Are there any items attached to this category?
  const attachedEquipmentCount = await InventoryRepo.countEquipmentByCategory(categoryId);
  
  if (attachedEquipmentCount > 0) {
    throw new Error(`Cannot delete category. There are ${attachedEquipmentCount} equipment units tied to this category in the database.`);
  }

  // 3. Safe to delete
  await InventoryRepo.deleteCategory(categoryId);
  
  return { message: `Category '${category.name_en}' successfully deleted.` };
};
import Equipment from './equipment.model.js';
import EquipmentCategory from './category.model.js';

export const findEquipmentById = async (id) => {
  return await Equipment.findByPk(id);
};

export const findEquipmentBySerial = async (equipment_id) => {
  return await Equipment.findOne({ where: { equipment_id } });
};

export const createEquipment = async (data) => {
  return await Equipment.create(data);
};

export const deleteEquipment = async (id) => {
  return await Equipment.destroy({ where: { id } }); 
};

export const findCategoryById = async (id) => {
  return await EquipmentCategory.findByPk(id);
};

export const updateCategory = async (id, data) => {
  return await EquipmentCategory.update(data, { where: { id } });
};



export const findAllAvailableEquipment = async () => {
  return await Equipment.findAll({
    where: { status: 'Available' },
    include: [
      {
        model: EquipmentCategory,
        attributes: ['name_hi', 'name_en', 'deposit_amount', 'daily_rent'] 
      }
    ],
    order: [['category_id', 'ASC']] 
  });
};

export const findAllCategoriesWithStock = async () => {
  return await EquipmentCategory.findAll({
    include: [{
      model: Equipment,
      required: false, 
      attributes: ['status'] 
    }]
  });
};

export const countEquipmentByCategory = async (category_id) => {
  return await Equipment.count({ 
    where: { category_id },
    paranoid: false 
  });
};

export const deleteCategory = async (id) => {
  return await EquipmentCategory.destroy({ where: { id } });
};
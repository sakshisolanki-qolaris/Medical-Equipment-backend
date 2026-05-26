import { Op } from 'sequelize';
import Allocation from './allocation.model.js';
import Equipment from '../inventory/equipment.model.js';
import EquipmentCategory from '../inventory/category.model.js';

export const findAvailableEquipmentWithPricing = async (serial_id, transaction) => {
  return await Equipment.findOne({
   where: { equipment_id: serial_id, status: 'Available' },
    include: [{ model: EquipmentCategory }],
    transaction // Lock this query into the current transaction
  });
};

export const createNewAllocation = async (allocationData, transaction) => {
  return await Allocation.create(allocationData, { transaction });
};


export const findCursorPaginatedAllocations = async ({ limit, cursor, filters }) => {
  const whereClause = {};
  
  if (filters.status) whereClause.status = filters.status;
  if (filters.recipient_phone) whereClause.recipient_phone = filters.recipient_phone;

  if (cursor) {
    whereClause.id = {
      [Op.lt]: cursor
    };
  }

  return await Allocation.findAll({
    where: whereClause,
    limit: limit + 1, // Fetch one extra record to check if a next page exists
    order: [['id', 'DESC']], // Deterministic sorting is mandatory for cursors
    include: [{
      model: Equipment,
      attributes: ['equipment_id', 'status'],
      include: [{ 
        model: EquipmentCategory, 
        attributes: ['name_en', 'name_hi', 'daily_rent'] 
      }]
    }]
  });
};
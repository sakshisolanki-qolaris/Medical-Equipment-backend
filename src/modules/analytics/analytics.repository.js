import { Op } from 'sequelize';
import Allocation from '../allocation/allocation.model.js';
import Equipment from '../inventory/equipment.model.js';
import EquipmentCategory from '../inventory/category.model.js';
import Payment from '../billing/payment.model.js'; // NEW: Import Payment Model

export const countActiveAllocations = async () => {
  return await Allocation.count({ where: { status: 'Active' } });
};

export const getPeriodMetrics = async (startDate, endDate) => {
  const newAllocations = await Allocation.count({
    where: { allocation_start_time: { [Op.between]: [startDate, endDate] } }
  });

  const completedReturns = await Allocation.count({
    where: { return_time: { [Op.between]: [startDate, endDate] }, status: 'Completed' }
  });

  return { newAllocations, completedReturns };
};

export const getInventoryStats = async () => {
  const total = await Equipment.count();
  const available = await Equipment.count({ where: { status: 'Available' } });
  const allotted = await Equipment.count({ where: { status: 'Allotted' } });
  
  return { total, available, allotted };
};

export const getCategoriesWithAvailableStock = async () => {
  return await EquipmentCategory.findAll({
    include: [{
      model: Equipment,
      required: false,
      where: { status: 'Available' },
      attributes: ['id']
    }]
  });
};

export const getFinancialMetrics = async (startDate, endDate) => {
  // 1. Sum Money IN (Deposits from the Payments table)
  const totalDeposits = await Payment.sum('amount', {
    where: { 
      transaction_type: 'Deposit_IN',
      createdAt: { [Op.between]: [startDate, endDate] } 
    }
  });

  // 2. Sum Money OUT (Refunds from the Payments table)
  const totalRefunds = await Payment.sum('amount', {
    where: { 
      transaction_type: 'Refund_OUT',
      createdAt: { [Op.between]: [startDate, endDate] } 
    }
  });

  // 3. Sum Money IN (Extra Rent taken at the desk from the Payments table)
  const totalRentCollectedInCash = await Payment.sum('amount', {
    where: { 
      transaction_type: 'Rent_IN',
      createdAt: { [Op.between]: [startDate, endDate] } 
    }
  });

  // 4. Sum the True Revenue (Calculated and stored on the Allocation table at completion)
  const totalRentEarned = await Allocation.sum('rent_earned', {
    where: { 
      return_time: { [Op.between]: [startDate, endDate] }, 
      status: 'Completed' 
    }
  });

  return {
    collected: totalDeposits || 0,
    refunded: totalRefunds || 0,
    rent_collected: totalRentCollectedInCash || 0,
    rent_earned: totalRentEarned || 0 
  };
};
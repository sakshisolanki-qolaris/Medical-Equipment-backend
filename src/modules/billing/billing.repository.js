import Allocation from '../allocation/allocation.model.js';
import Equipment from '../inventory/equipment.model.js';
import EquipmentCategory from '../inventory/category.model.js';
import Payment from './payment.model.js';

export const findActiveAllocationWithPricing = async (allocationId, transaction) => {
  return await Allocation.findOne({
    where: { id: allocationId, status: 'Active' },
    include: [{
      model: Equipment,
      include: [{ model: EquipmentCategory }]
    }],
    transaction
  });
};


export const getCompletedAllocationForInvoice = async (allocationId) => {
  return await Allocation.findOne({
    where: { id: allocationId, status: 'Completed' },
    include: [
      {
        model: Equipment,
        include: [{ model: EquipmentCategory }]
      },
      {
        model: Payment // NEW: Tells Sequelize to fetch the financial ledger!
      }
    ]
  });
};
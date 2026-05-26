import sequelize from '../../config/database.js';
import * as AllocationRepo from './allocation.repository.js';
import Payment from '../billing/payment.model.js';

export const processAllocation = async (payload) => {
  const transaction = await sequelize.transaction();

  try {
    const equipment = await AllocationRepo.findAvailableEquipmentWithPricing(payload.equipment_id, transaction);
    
    if (!equipment) throw new Error('Equipment is either invalid, deleted, or currently allotted.');

    // Caution Money Logic
    const standardDeposit = equipment.EquipmentCategory.deposit_amount;
    if (payload.recipient_type === 'Standard' && payload.deposit_paid < standardDeposit) {
      throw new Error(`Insufficient deposit. Standard users must pay ₹${standardDeposit}.`);
    }

    // 1. Create the Clean Allocation Record
    const newAllocation = await AllocationRepo.createNewAllocation({
      equipment_id: equipment.id,
      recipient_name: payload.recipient_name,
      recipient_phone: payload.recipient_phone,
      recipient_type: payload.recipient_type,
      status: 'Active'
    }, transaction);

    // 2. Create the Financial Ledger Record (If money exchanged hands)
    if (payload.deposit_paid > 0) {
      await Payment.create({
        allocation_id: newAllocation.id,
        amount: payload.deposit_paid,
        transaction_type: 'Deposit_IN',
        payment_mode: payload.deposit_mode || 'Cash',
        transaction_reference: payload.transaction_reference || null
      }, { transaction });
    }

    await equipment.update({ status: 'Allotted' }, { transaction });
    await transaction.commit();

    return {
      message: 'Equipment successfully allocated.',
      allocation_id: newAllocation.id,
      equipment_name: equipment.EquipmentCategory.name_en
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};



export const getCursorPaginatedAllocations = async (queryParams) => {
  // 1. Set limit and extract the cursor
  const limit = parseInt(queryParams.limit, 10) || 10;
  if (limit > 50) limit = 50;
  const cursor = queryParams.cursor ? parseInt(queryParams.cursor, 10) : null;

  // 2. Extract Filters
  const filters = {
    status: queryParams.status,
    recipient_phone: queryParams.recipient_phone
  };

  // 3. Fetch Data
  const rows = await AllocationRepo.findCursorPaginatedAllocations({ limit, cursor, filters });

  // 4. Calculate Cursor Metadata
  let hasNextPage = false;
  let nextCursor = null;

  // If we got back more items than the limit, there is another page
  if (rows.length > limit) {
    hasNextPage = true;
    rows.pop(); // Remove the extra item so we only return the exact limit requested
    nextCursor = rows[rows.length - 1].id;
  }


  return {
    metadata: {
      next_cursor: nextCursor,
      has_next_page: hasNextPage,
      limit: limit
    },
    data: rows
  };
};
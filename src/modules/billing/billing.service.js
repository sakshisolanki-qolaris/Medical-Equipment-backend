import sequelize from '../../config/database.js';
import * as BillingRepo from './billing.repository.js';
import Payment from './payment.model.js';

export const processEquipmentReturn = async (allocationId, payload) => {
  const transaction = await sequelize.transaction();

  try {
    const allocation = await BillingRepo.findActiveAllocationWithPricing(allocationId, transaction);
    if (!allocation) throw new Error('Active allocation not found or already returned.');

    // 1. Fetch original deposit from the Payments table
    const depositRecord = await Payment.findOne({
      where: { allocation_id: allocation.id, transaction_type: 'Deposit_IN' },
      transaction
    });
    const depositPaid = depositRecord ? depositRecord.amount : 0;

    // 2. Time and Rent Math
    const startTime = new Date(allocation.allocation_start_time);
    const returnTime = payload.return_time ? new Date(payload.return_time) : new Date();

    if (returnTime < startTime) throw new Error('Return time cannot be before start time.');
    
    const msInDay = 24 * 60 * 60 * 1000;
    let daysUsed = Math.ceil((returnTime - startTime) / msInDay);
    if (daysUsed < 1) daysUsed = 1;

    const totalRentCalculated = daysUsed * allocation.Equipment.EquipmentCategory.daily_rent;

    // 3. Financial Settlement
    let finalRefundAmount = 0;
    let amountDue = 0;
    const amountReceivedAtDesk = payload.amount_received || 0;
    const settlement = depositPaid - totalRentCalculated;

    if (settlement > 0) {
      finalRefundAmount = settlement;
    } else if (settlement < 0) {
      amountDue = Math.abs(settlement);
      if (allocation.recipient_type === 'Standard' && amountReceivedAtDesk < amountDue) {
        throw new Error(`Insufficient payment. User owes ₹${amountDue}.`);
      }
    }

    const rentDeductedFromDeposit = Math.min(depositPaid, totalRentCalculated);
    const trueRentEarned = rentDeductedFromDeposit + amountReceivedAtDesk;
    // 4. Update the Allocation Status
    await allocation.update({ return_time: returnTime, status: 'Completed',rent_earned: trueRentEarned }, { transaction });
    await allocation.Equipment.update({ status: 'Available' }, { transaction });

    // 5. WRITE TO THE LEDGER (Payments Table)
    
    // A. Log the Refund (Money OUT)
    if (finalRefundAmount > 0) {
      await Payment.create({
        allocation_id: allocation.id,
        amount: finalRefundAmount,
        transaction_type: 'Refund_OUT',
        payment_mode: payload.refund_mode || 'Cash',
        transaction_reference: payload.refund_transaction_reference || null
      }, { transaction });
    }

    // B. Log the Extra Rent Collected (Money IN)
    if (amountReceivedAtDesk > 0) {
      await Payment.create({
        allocation_id: allocation.id,
        amount: amountReceivedAtDesk,
        transaction_type: 'Rent_IN',
        payment_mode: payload.rent_payment_mode || 'Cash',
        transaction_reference: payload.rent_transaction_reference || null
      }, { transaction });
    }

    await transaction.commit();

    return {
      message: 'Equipment returned and billed successfully.',
      receipt: {
        allocation_id: allocation.id,
        total_rent_accrued: totalRentCalculated,
        deposit_paid: depositPaid,
        refund_issued: finalRefundAmount,
        additional_cash_received_at_counter: amountReceivedAtDesk,
        status: 'Settled'
      }
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
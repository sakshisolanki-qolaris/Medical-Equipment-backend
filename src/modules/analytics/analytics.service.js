import * as AnalyticsRepo from './analytics.repository.js';
import Payment from '../billing/payment.model.js';
import Allocation from '../allocation/allocation.model.js';
import Equipment from '../inventory/equipment.model.js';
import EquipmentCategory from '../inventory/category.model.js';
import { Op } from 'sequelize';

export const generateDashboardReport = async (queryDates) => {
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDate = queryDates?.startDate ? new Date(queryDates.startDate) : defaultStart;
  
  let endDate = now;
  if (queryDates?.endDate) {
    endDate = new Date(queryDates.endDate);
    endDate.setHours(23, 59, 59, 999); 
  }

  const [
    activeAllocations,
    periodMetrics,
    inventoryStats,
    categories,
    financials 
  ] = await Promise.all([
    AnalyticsRepo.countActiveAllocations(),
    AnalyticsRepo.getPeriodMetrics(startDate, endDate),
    AnalyticsRepo.getInventoryStats(),
    AnalyticsRepo.getCategoriesWithAvailableStock(),
    AnalyticsRepo.getFinancialMetrics(startDate, endDate) 
  ]);

  let itemsNeedingRestock = 0;
  const lowStockAlerts = [];

  categories.forEach(category => {
    const availableCount = category.Equipment ? category.Equipment.length : 0;
    if (availableCount === 0) {
      itemsNeedingRestock++;
      lowStockAlerts.push(category.name_en);
    }
  });

  // Calculate Cash Flow
  const totalGrossMoneyIn = financials.collected + financials.rent_collected;
  const netCashFlow = totalGrossMoneyIn - financials.refunded;

  return {
    date_range: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    financial_summary: {
      revenue: {
        total_rent_earned: financials.rent_earned
      },
      cash_flow: {
        total_deposits_collected: financials.collected,
        additional_cash_collected_at_return: financials.rent_collected,
        total_gross_money_in: totalGrossMoneyIn,
        total_refunds_issued: financials.refunded,
        net_cash_in_bank: netCashFlow 
      }
    },
    period_metrics: {
      new_allocations: periodMetrics.newAllocations,
      completed_returns: periodMetrics.completedReturns
    },
    real_time_snapshots: {
      active_allocations_now: activeAllocations,
      inventory: {
        total_units: inventoryStats.total,
        available_now: inventoryStats.available,
        currently_allotted: inventoryStats.allotted,
        utilization_rate: inventoryStats.total > 0 
          ? Math.round((inventoryStats.allotted / inventoryStats.total) * 100) 
          : 0
      }
    },
    alerts: {
      categories_out_of_stock: itemsNeedingRestock,
      restock_list: lowStockAlerts
    }
  };
};

export const getFinancialLedger = async (queryDates) => {
  const startDate = queryDates?.startDate ? new Date(queryDates.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let endDate = queryDates?.endDate ? new Date(queryDates.endDate) : new Date();
  if (queryDates?.endDate) endDate.setHours(23, 59, 59, 999);

  // Directly fetch all transactions from the new Payment ledger
  const payments = await Payment.findAll({
    where: {
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    include: [{
      model: Allocation,
      attributes: ['id', 'recipient_name'],
      include: [{
        model: Equipment,
        attributes: ['id'],
        include: [{ model: EquipmentCategory, attributes: ['name_en'] }]
      }]
    }],
    order: [['createdAt', 'DESC']]
  });

  // Map directly to the frontend table format
  const ledger = payments.map(payment => {
    const equipName = payment.Allocation?.Equipment?.EquipmentCategory?.name_en || 'Unknown Equipment';
    
    let description = '';
    if (payment.transaction_type === 'Deposit_IN') description = `Caution money collected for ${equipName}`;
    if (payment.transaction_type === 'Refund_OUT') description = `Refund issued for returning ${equipName}`;
    if (payment.transaction_type === 'Rent_IN') description = `Rent payment collected for ${equipName}`;

    return {
      transaction_id: `TXN-${payment.allocation_id}-${payment.id}`,
      date: payment.createdAt,
      type: payment.transaction_type,
      amount: payment.amount,
      mode: payment.payment_mode,
      utr: payment.transaction_reference || 'N/A',
      recipient: payment.Allocation?.recipient_name || 'Unknown',
      description
    };
  });

  const totalIn = ledger.filter(item => item.type.includes('IN')).reduce((sum, item) => sum + item.amount, 0);
  const totalOut = ledger.filter(item => item.type.includes('OUT')).reduce((sum, item) => sum + item.amount, 0);

  return {
    period: { start: startDate, end: endDate },
    summary: {
      total_money_in: totalIn,
      total_money_out: totalOut,
      net_cash_flow: totalIn - totalOut
    },
    transactions: ledger
  };
};
import * as AnalyticsService from './analytics.service.js';

export const fetchDashboardMetrics = async (req, res) => {
  try {
    // Extract query parameters from the URL
    const { startDate, endDate } = req.query;

    const report = await AnalyticsService.generateDashboardReport({ startDate, endDate });
    
    return res.status(200).json({
      message: 'Dashboard metrics generated successfully',
      data: report
    });
  } catch (error) {
    console.error('Analytics Generation Error:', error);
    return res.status(500).json({ error: 'Failed to generate dashboard analytics' });
  }
};



export const fetchLedger = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const ledger = await AnalyticsService.getFinancialLedger({ startDate, endDate });
    
    return res.status(200).json({
      message: 'Financial ledger generated successfully',
      data: ledger
    });
  } catch (error) {
    console.error('Ledger Generation Error:', error);
    return res.status(500).json({ error: 'Failed to generate financial ledger' });
  }
};
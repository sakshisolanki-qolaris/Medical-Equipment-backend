import * as BillingService from './billing.service.js';
import * as BillingRepo from './billing.repository.js';
import { buildInvoicePdf } from '../../utils/pdfGenerator.js';

export const processReturn = async (req, res) => {
  try {

    const allocationId = req.params.id; 
    
    const result = await BillingService.processEquipmentReturn(allocationId, req.body);
    
    return res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('Insufficient payment') || error.message.includes('not found')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Billing Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const downloadInvoice = async (req, res) => {
  try {
    const allocationId = req.params.id;
    
    // This now fetches the Allocation AND the Payments array
    const allocationData = await BillingRepo.getCompletedAllocationForInvoice(allocationId);
    
    if (!allocationData) {
      return res.status(404).json({ error: 'Completed transaction not found.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_TXN_${allocationId}.pdf`);

    buildInvoicePdf(allocationData, res);

  } catch (error) {
    console.error('Invoice Generation Error:', error);
    return res.status(500).json({ error: 'Failed to generate invoice' });
  }
};
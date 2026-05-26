import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module workaround to get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const buildInvoicePdf = (allocationData, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Resolve the path to your Hindi font
  const hindiFontPath = path.join(__dirname, '../assets/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf');
  doc.registerFont('HindiFont', hindiFontPath);

  doc.pipe(res);

  // --- Header ---
  doc.font('Helvetica-Bold').fontSize(20).text('Maharashtra Mandal Raipur', { align: 'center' });
  doc.font('Helvetica').fontSize(12).text('Equipment Depot Receipt', { align: 'center' });
  doc.moveDown();
  
  // --- Transaction Details ---
  doc.fontSize(10).text(`Transaction ID: TXN-${allocationData.id}`);
  doc.text(`Generated On: ${new Date().toLocaleString()}`);
  doc.text(`Recipient: ${allocationData.recipient_name} (${allocationData.recipient_type})`);
  doc.text(`Phone: ${allocationData.recipient_phone}`);
  doc.moveDown();

  // --- Itemized Breakdown ---
  const equipment = allocationData.Equipment;
  const category = equipment.EquipmentCategory;
  
  doc.font('Helvetica-Bold').fontSize(14).text('Rental Details', { underline: true });
  doc.moveDown(0.5);
  
  // Bilingual Equipment Name
  doc.font('HindiFont').fontSize(12).text(`Equipment: ${category.name_en} (${category.name_hi})`);
  
  // Switch back to standard font
  doc.font('Helvetica').fontSize(10).text(`Serial No: ${equipment.equipment_id}`);
  
  // Date Formatting & Printing
  const startTime = new Date(allocationData.allocation_start_time);
  const returnTime = new Date(allocationData.return_time);
  
  doc.text(`Issue Date: ${startTime.toLocaleString()}`);
  doc.text(`Return Date: ${returnTime.toLocaleString()}`);

  const msInDay = 24 * 60 * 60 * 1000;
  let daysUsed = Math.ceil((returnTime - startTime) / msInDay);
  if (daysUsed < 1) daysUsed = 1;

  doc.text(`Total Days Billed: ${daysUsed}`);
  doc.text(`Daily Rent Rate: Rs. ${category.daily_rent}`);
  doc.moveDown();

  // --- Financial Summary ---
  doc.font('Helvetica-Bold').fontSize(14).text('Financial Summary', { underline: true });
  doc.font('Helvetica').fontSize(10).moveDown(0.5);
  
  const totalRent = daysUsed * category.daily_rent;
  doc.text(`Total Rent Accrued: Rs. ${totalRent}`);
  
  // 1. Safely extract the payment records from the included array
  const payments = allocationData.Payments || [];
  const depositRecord = payments.find(p => p.transaction_type === 'Deposit_IN');
  const refundRecord = payments.find(p => p.transaction_type === 'Refund_OUT');
  const rentRecord = payments.find(p => p.transaction_type === 'Rent_IN');

  // 2. Print Deposit details safely
  const depositAmount = depositRecord ? depositRecord.amount : 0;
  const depositMode = depositRecord ? depositRecord.payment_mode.replace('_', ' ') : 'None';
  
  doc.text(`Initial Deposit Paid: Rs. ${depositAmount} (${depositMode})`);
  
  if (depositRecord && depositRecord.payment_mode !== 'Cash' && depositRecord.transaction_reference) {
    doc.text(`Deposit UTR/Ref: ${depositRecord.transaction_reference}`);
  }
  
  doc.moveDown();
  
  // 3. Print Settlement Details safely
  if (refundRecord) {
    // SCENARIO A: We owed the user a refund
    doc.font('Helvetica-Bold').text(`Refund Issued: Rs. ${refundRecord.amount} (${refundRecord.payment_mode.replace('_', ' ')})`);
    if (refundRecord.payment_mode !== 'Cash' && refundRecord.transaction_reference) {
      doc.text(`Refund UTR/Ref: ${refundRecord.transaction_reference}`);
    }
  } else {
    // SCENARIO B: The user owed us rent (or it was perfectly even)
    const rentPaidAtReturn = rentRecord ? rentRecord.amount : 0;

    if (rentPaidAtReturn > 0) {
      const rentMode = rentRecord.payment_mode.replace('_', ' ');
      doc.text(`Paid at Return: Rs. ${rentPaidAtReturn} (${rentMode})`);
      
      if (rentRecord.payment_mode !== 'Cash' && rentRecord.transaction_reference) {
        doc.text(`Payment UTR/Ref: ${rentRecord.transaction_reference}`);
      }
    }

    doc.moveDown(0.5);

    // Calculate remaining balance using the rent_earned field
    const remainingBalance = totalRent - (allocationData.rent_earned || 0);

    if (remainingBalance > 0) {
      doc.font('Helvetica-Bold').text(`Remaining Balance Owed: Rs. ${remainingBalance}`);
    } else {
      doc.font('Helvetica-Bold').text(`Status: Fully Settled`);
    }
  }

  // --- Footer ---
  doc.moveDown(3);
  doc.font('Helvetica').fontSize(10).text('Thank you for using our services.', { align: 'center' });
  
  doc.end();
};
import sequelize from '../config/database.js';
import EquipmentCategory from '../modules/inventory/category.model.js';
import Equipment from '../modules/inventory/equipment.model.js';

const categoryData = [
  { id: 1, name_hi: 'मेडिकल- पलंग', name_en: 'Medical Bed', deposit_amount: 5000, daily_rent: 20 },
  { id: 2, name_hi: 'व्हील चेयर', name_en: 'Wheel Chair', deposit_amount: 2000, daily_rent: 10 },
  { id: 3, name_hi: 'वाकर', name_en: 'Walker', deposit_amount: 500, daily_rent: 10 },
  { id: 4, name_hi: 'कमोड चेयर', name_en: 'Commode Chair', deposit_amount: 500, daily_rent: 10 },
  { id: 5, name_hi: 'साईड रेलिंग', name_en: 'Side Railing', deposit_amount: 0, daily_rent: 10 },
  { id: 6, name_hi: 'स्टिक', name_en: 'Stick', deposit_amount: 500, daily_rent: 10 },
  { id: 7, name_hi: 'बैसाखी', name_en: 'Crutches', deposit_amount: 500, daily_rent: 10 },
  { id: 8, name_hi: 'एयर बेड', name_en: 'Air Bed', deposit_amount: 2000, daily_rent: 10 },
  { id: 9, name_hi: 'नेबोलाईजर', name_en: 'Nebulizer', deposit_amount: 500, daily_rent: 10 },
  { id: 10, name_hi: 'सक्शन मशीन', name_en: 'Suction Machine', deposit_amount: 1000, daily_rent: 10 },
  { id: 11, name_hi: 'ग्लूकोज स्टैंड', name_en: 'Glucose Stand', deposit_amount: 500, daily_rent: 10 },
  { id: 12, name_hi: 'स्ट्रेचर', name_en: 'Stretcher', deposit_amount: 500, daily_rent: 10 },
  { id: 13, name_hi: 'ऑक्सीजन कंसंट्रेटर', name_en: 'Oxygen Concentrator', deposit_amount: 5000, daily_rent: 200 },
  { id: 14, name_hi: 'खाना टेबल', name_en: 'Food Table', deposit_amount: 500, daily_rent: 10 },
  { id: 15, name_hi: 'गद्दा', name_en: 'Mattress', deposit_amount: 0, daily_rent: 10 },
];

const sampleEquipmentData = [
  { equipment_id: 'BED-001', category_id: 1, status: 'Available' },
  { equipment_id: 'BED-002', category_id: 1, status: 'Available' },
  { equipment_id: 'OXY-001', category_id: 13, status: 'Available' },
  { equipment_id: 'WHL-001', category_id: 2, status: 'Available' },
];

const runSeeder = async () => {
  try {
    await sequelize.authenticate();
    
    // Bulk create categories (ignoreDuplicates prevents crashing if run twice)
    await EquipmentCategory.bulkCreate(categoryData, { updateOnDuplicate: ['deposit_amount', 'daily_rent'] });
    console.log('Categories seeded successfully.');

    // Bulk create sample physical items
    await Equipment.bulkCreate(sampleEquipmentData, { ignoreDuplicates: true });
    console.log('Sample equipment seeded successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Seeder failed:', error);
    process.exit(1);
  }
};

runSeeder();
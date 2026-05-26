import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const EquipmentCategory = sequelize.define('EquipmentCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name_hi: { type: DataTypes.STRING, allowNull: false },
  name_en: { type: DataTypes.STRING, allowNull: false },
  deposit_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  daily_rent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }
}, {
  tableName: 'equipment_categories',
  timestamps: false,
});

export default EquipmentCategory;
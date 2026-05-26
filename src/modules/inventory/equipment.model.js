import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import EquipmentCategory from './category.model.js';

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  equipment_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false, // The physical serial number or barcode
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: EquipmentCategory, key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('Available', 'Allotted', 'Decommissioned'),
    defaultValue: 'Available',
    allowNull: false,
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  }
}, {
  tableName: 'equipments',
  timestamps: true,
  paranoid: true, // Enables Soft Deletes (adds deletedAt column)
});

// Associations
EquipmentCategory.hasMany(Equipment, { foreignKey: 'category_id' });
Equipment.belongsTo(EquipmentCategory, { foreignKey: 'category_id' });

export default Equipment;
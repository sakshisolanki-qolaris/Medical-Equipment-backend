import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Equipment from '../inventory/equipment.model.js';

const Allocation = sequelize.define('Allocation', {
  recipient_name: { type: DataTypes.STRING(100), allowNull: false },
  recipient_phone: { type: DataTypes.STRING(15), allowNull: false },
  recipient_type: { type: DataTypes.ENUM('Standard', 'Member', 'Authority'), allowNull: false },
  status: { type: DataTypes.ENUM('Active', 'Completed'), defaultValue: 'Active' },
  allocation_start_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  return_time: { type: DataTypes.DATE, allowNull: true },
  rent_earned: { type: DataTypes.INTEGER, defaultValue: 0 }
});

Allocation.belongsTo(Equipment, { foreignKey: 'equipment_id' });
Equipment.hasMany(Allocation, { foreignKey: 'equipment_id' });

export default Allocation;
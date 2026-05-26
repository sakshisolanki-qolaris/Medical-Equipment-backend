import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Allocation from '../allocation/allocation.model.js';

const Payment = sequelize.define('Payment', {
  allocation_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  amount: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  transaction_type: { 
    type: DataTypes.ENUM('Deposit_IN', 'Rent_IN', 'Refund_OUT'), 
    allowNull: false 
  },
  payment_mode: { 
    type: DataTypes.ENUM('Cash', 'UPI_QR', 'Direct_Bank', 'None'), 
    allowNull: false 
  },
  transaction_reference: { 
    type: DataTypes.STRING(100), 
    allowNull: true 
  }
});

// Establish Relationships
Allocation.hasMany(Payment, { foreignKey: 'allocation_id' });
Payment.belongsTo(Allocation, { foreignKey: 'allocation_id' });

export default Payment;
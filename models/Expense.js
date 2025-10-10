const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Please provide a description',
      },
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'Amount must be a valid number',
      },
      min: {
        args: [0],
        msg: 'Amount must be positive',
      },
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Please provide a category',
      },
    },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: {
        msg: 'Please provide a valid date',
      },
    },
  },
  paidBy: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Please specify who paid',
      },
    },
  },
}, {
  tableName: 'expenses',
  timestamps: true,
  indexes: [
    {
      fields: ['date'],
    },
    {
      fields: ['category'],
    },
    {
      fields: ['paidBy'],
    },
  ],
});

module.exports = Expense;

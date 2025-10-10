const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Please provide a category name',
      },
    },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(7), // Hex color code #RRGGBB
    allowNull: true,
    defaultValue: '#3498db',
    validate: {
      is: {
        args: /^#[0-9A-F]{6}$/i,
        msg: 'Color must be a valid hex code (e.g., #3498db)',
      },
    },
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name'],
    },
  ],
});

module.exports = Category;


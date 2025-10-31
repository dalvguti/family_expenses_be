/**
 * Migration Script: Add transactionType column to expenses table
 * 
 * This script adds the transactionType ENUM column to the expenses table
 * and sets default values for existing records.
 * 
 * Run this script once to update your database schema.
 */

// Load environment variables first
require('dotenv').config();

const { sequelize } = require('../config/database');

async function migrate() {
  try {
    console.log('Starting migration: Adding transactionType column...');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'expenses' 
      AND COLUMN_NAME = 'transactionType';
    `);

    if (results.length > 0) {
      console.log('Column transactionType already exists. Skipping migration.');
      return;
    }

    // Add the transactionType column
    await sequelize.query(`
      ALTER TABLE expenses 
      ADD COLUMN transactionType ENUM('expense', 'earning') 
      NOT NULL DEFAULT 'expense'
      AFTER paidBy;
    `);

    console.log('✓ Added transactionType column');

    // Update all existing records to have 'expense' as default
    await sequelize.query(`
      UPDATE expenses 
      SET transactionType = 'expense' 
      WHERE transactionType IS NULL;
    `);

    console.log('✓ Updated existing records with default value');

    // Add index on transactionType for better query performance
    await sequelize.query(`
      CREATE INDEX idx_transactionType 
      ON expenses(transactionType);
    `);

    console.log('✓ Added index on transactionType');

    console.log('\n✅ Migration completed successfully!');
    console.log('\nYou can now use the expense/earning feature.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nIf the column already exists, this is expected.');
    console.error('Otherwise, please check your database connection and permissions.');
  } finally {
    await sequelize.close();
  }
}

// Run migration
migrate();


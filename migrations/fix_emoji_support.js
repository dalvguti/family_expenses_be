/**
 * Migration Script: Fix emoji support for categories table
 * 
 * This script updates the categories table and its columns to use utf8mb4
 * charset and collation, which is required to store emojis.
 * 
 * Run this script once to update your database schema.
 */

// Load environment variables first
require('dotenv').config();

const { sequelize } = require('../config/database');

async function migrate() {
  try {
    console.log('Starting migration: Fixing emoji support for categories...');

    // Get database name
    const dbName = process.env.DB_NAME;
    console.log(`Working on database: ${dbName}`);

    // Convert the categories table to utf8mb4
    await sequelize.query(`
      ALTER TABLE categories 
      CONVERT TO CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci;
    `);

    console.log('✓ Converted categories table to utf8mb4');

    // Specifically update the icon column to support emojis
    await sequelize.query(`
      ALTER TABLE categories 
      MODIFY COLUMN icon VARCHAR(255) 
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci;
    `);

    console.log('✓ Updated icon column to support emojis');

    // Update the name column as well
    await sequelize.query(`
      ALTER TABLE categories 
      MODIFY COLUMN name VARCHAR(255) 
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci;
    `);

    console.log('✓ Updated name column to support emojis');

    // Update the description column if it exists
    await sequelize.query(`
      ALTER TABLE categories 
      MODIFY COLUMN description VARCHAR(255) 
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci;
    `);

    console.log('✓ Updated description column to support emojis');

    console.log('\n✅ Migration completed successfully!');
    console.log('\nYou can now save emojis in category icons! 🎉');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nPlease check your database connection and permissions.');
    console.error('Error details:', error);
  } finally {
    await sequelize.close();
  }
}

// Run migration
migrate();


/**
 * Database Synchronization Script
 * 
 * This script synchronizes the database schema with the Sequelize models.
 * It will create missing tables and columns safely.
 */

const { sequelize } = require('./config/database');
const User = require('./models/User');
const Category = require('./models/Category');
const Expense = require('./models/Expense');

async function syncDatabase() {
  try {
    console.log('Starting database synchronization...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully\n');

    // Sync all models
    // { alter: true } will modify existing tables to match models
    // This is safer than { force: true } which drops tables
    
    console.log('Synchronizing User model...');
    await User.sync({ alter: true });
    console.log('✓ User table synchronized\n');

    console.log('Synchronizing Category model...');
    await Category.sync({ alter: true });
    console.log('✓ Category table synchronized\n');

    console.log('Synchronizing Expense model...');
    await Expense.sync({ alter: true });
    console.log('✓ Expense table synchronized\n');

    console.log('✅ Database synchronization completed successfully!\n');
    
    // Show current table structure
    console.log('📊 Current table structures:\n');
    
    const [userColumns] = await sequelize.query('DESCRIBE users');
    console.log('Users table columns:');
    userColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('');

    const [categoryColumns] = await sequelize.query('DESCRIBE categories');
    console.log('Categories table columns:');
    categoryColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('');

    const [expenseColumns] = await sequelize.query('DESCRIBE expenses');
    console.log('Expenses table columns:');
    expenseColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('');

    console.log('🎉 All done! Your database is now synchronized with the models.');
    
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
    console.error('\nFull error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      console.error('\n⚠️  Validation Error Details:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    }
    
    console.error('\nTroubleshooting:');
    console.error('1. Check your database connection in config/database.js');
    console.error('2. Ensure MySQL is running');
    console.error('3. Verify database credentials');
    console.error('4. Check if database exists');
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run synchronization
syncDatabase();


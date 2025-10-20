/**
 * Database Health Check Script
 * 
 * This script checks the current database state and identifies any issues.
 */

const { sequelize } = require('./config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and structure...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection successful\n');

    // Get database name
    const [dbResult] = await sequelize.query('SELECT DATABASE() as db');
    console.log(`📊 Database: ${dbResult[0].db}\n`);

    // Check if tables exist
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('📋 Existing tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    console.log('');

    // Check users table
    const userTableName = Object.values(tables.find(t => Object.values(t)[0] === 'users') || {})[0];
    if (userTableName) {
      console.log('👥 Users table structure:');
      const [userColumns] = await sequelize.query('DESCRIBE users');
      userColumns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
      });
      console.log('');

      // Check for required auth columns
      const hasUsername = userColumns.some(col => col.Field === 'username');
      const hasPassword = userColumns.some(col => col.Field === 'password');
      const hasIsActive = userColumns.some(col => col.Field === 'isActive');
      const hasRefreshToken = userColumns.some(col => col.Field === 'refreshToken');

      console.log('🔐 Authentication columns status:');
      console.log(`  - username: ${hasUsername ? '✓ EXISTS' : '✗ MISSING'}`);
      console.log(`  - password: ${hasPassword ? '✓ EXISTS' : '✗ MISSING'}`);
      console.log(`  - isActive: ${hasIsActive ? '✓ EXISTS' : '✗ MISSING'}`);
      console.log(`  - refreshToken: ${hasRefreshToken ? '✓ EXISTS' : '✗ MISSING'}`);
      console.log('');

      // Count users
      const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`👤 Total users: ${userCount[0].count}\n`);
    } else {
      console.log('⚠️  Users table does not exist!\n');
    }

    // Check expenses table
    const expenseTableName = Object.values(tables.find(t => Object.values(t)[0] === 'expenses') || {})[0];
    if (expenseTableName) {
      console.log('💰 Expenses table structure:');
      const [expenseColumns] = await sequelize.query('DESCRIBE expenses');
      expenseColumns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      console.log('');

      // Check for transactionType column
      const hasTransactionType = expenseColumns.some(col => col.Field === 'transactionType');
      console.log(`💸 Transaction type column: ${hasTransactionType ? '✓ EXISTS' : '✗ MISSING'}\n`);

      // Count expenses
      const [expenseCount] = await sequelize.query('SELECT COUNT(*) as count FROM expenses');
      console.log(`💰 Total transactions: ${expenseCount[0].count}\n`);
    }

    // Check categories table
    const categoryTableName = Object.values(tables.find(t => Object.values(t)[0] === 'categories') || {})[0];
    if (categoryTableName) {
      const [categoryCount] = await sequelize.query('SELECT COUNT(*) as count FROM categories');
      console.log(`🏷️  Total categories: ${categoryCount[0].count}\n`);
    }

    console.log('✅ Database health check completed!\n');
    
    // Recommendations
    console.log('📝 Recommendations:');
    if (!userTableName || !expenseTableName || !categoryTableName) {
      console.log('  ⚠️  Run: node sync-database.js');
    } else if (userTableName) {
      const [userColumns] = await sequelize.query('DESCRIBE users');
      const hasUsername = userColumns.some(col => col.Field === 'username');
      const hasPassword = userColumns.some(col => col.Field === 'password');
      
      if (!hasUsername || !hasPassword) {
        console.log('  ⚠️  Run: node migrations/add_auth_to_users.js');
      } else {
        console.log('  ✓ Database looks good!');
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('\nFull error:', error);
    console.error('\nPossible causes:');
    console.error('  1. Database connection issue');
    console.error('  2. Invalid credentials');
    console.error('  3. Database does not exist');
    console.error('  4. MySQL server not running');
  } finally {
    await sequelize.close();
  }
}

// Run check
checkDatabase();


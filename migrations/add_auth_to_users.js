/**
 * Migration Script: Add Authentication Fields to Users Table
 * 
 * This script adds the username, password, isActive, lastLogin, and refreshToken columns
 * to support authentication and authorization.
 * 
 * Run this script once to update your database schema.
 */

// Load environment variables first
require('dotenv').config();

const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

async function migrate() {
  try {
    console.log('Starting migration: Adding authentication fields to users table...\n');

    // Check and add username column
    const [usernameExists] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'username';
    `);

    if (usernameExists.length === 0) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN username VARCHAR(255) 
        AFTER name;
      `);
      console.log('✓ Added username column');

      // Generate usernames for existing users
      const [users] = await sequelize.query('SELECT id, email FROM users');
      for (const user of users) {
        const username = user.email.split('@')[0] + user.id;
        await sequelize.query('UPDATE users SET username = ? WHERE id = ?', {
          replacements: [username, user.id]
        });
      }
      console.log('✓ Generated usernames for existing users');

      // Make username NOT NULL and UNIQUE
      await sequelize.query(`
        ALTER TABLE users 
        MODIFY COLUMN username VARCHAR(255) NOT NULL,
        ADD UNIQUE KEY unique_username (username);
      `);
      console.log('✓ Set username constraints');
    } else {
      console.log('⚠ Username column already exists, skipping...');
    }

    // Check and add password column
    const [passwordExists] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'password';
    `);

    if (passwordExists.length === 0) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN password VARCHAR(255) 
        AFTER email;
      `);
      console.log('✓ Added password column');

      // Set default password for existing users (they'll need to change it)
      const defaultPassword = 'Welcome@123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      
      await sequelize.query('UPDATE users SET password = ? WHERE password IS NULL', {
        replacements: [hashedPassword]
      });
      console.log('✓ Set default password for existing users');
      console.log('  Default password: Welcome@123 (users should change this immediately)');

      // Make password NOT NULL
      await sequelize.query(`
        ALTER TABLE users 
        MODIFY COLUMN password VARCHAR(255) NOT NULL;
      `);
      console.log('✓ Set password constraints');
    } else {
      console.log('⚠ Password column already exists, skipping...');
    }

    // Check and add isActive column
    const [isActiveExists] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'isActive';
    `);

    if (isActiveExists.length === 0) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN isActive BOOLEAN DEFAULT true 
        AFTER role;
      `);
      console.log('✓ Added isActive column');
    } else {
      console.log('⚠ isActive column already exists, skipping...');
    }

    // Check and add lastLogin column
    const [lastLoginExists] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'lastLogin';
    `);

    if (lastLoginExists.length === 0) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN lastLogin DATETIME NULL 
        AFTER isActive;
      `);
      console.log('✓ Added lastLogin column');
    } else {
      console.log('⚠ lastLogin column already exists, skipping...');
    }

    // Check and add refreshToken column
    const [refreshTokenExists] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'refreshToken';
    `);

    if (refreshTokenExists.length === 0) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN refreshToken TEXT NULL 
        AFTER lastLogin;
      `);
      console.log('✓ Added refreshToken column');
    } else {
      console.log('⚠ refreshToken column already exists, skipping...');
    }

    // Add indexes for better performance
    try {
      await sequelize.query(`
        CREATE INDEX idx_username ON users(username);
      `);
      console.log('✓ Added index on username');
    } catch (e) {
      console.log('⚠ Index on username may already exist');
    }

    try {
      await sequelize.query(`
        CREATE INDEX idx_isActive ON users(isActive);
      `);
      console.log('✓ Added index on isActive');
    } catch (e) {
      console.log('⚠ Index on isActive may already exist');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 IMPORTANT NOTES:');
    console.log('   - Existing users have been assigned auto-generated usernames');
    console.log('   - Default password for existing users: Welcome@123');
    console.log('   - Users should change their password after first login');
    console.log('   - You can now use the authentication system!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    console.error('\nIf columns already exist, this is expected.');
    console.error('Otherwise, please check your database connection and permissions.');
  } finally {
    await sequelize.close();
  }
}

// Run migration
migrate();


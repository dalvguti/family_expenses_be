// Load environment variables first
require('dotenv').config();

const { sequelize } = require('./config/database');
const User = require('./models/User');

const defaultUsers = [
  { 
    name: 'John Doe', 
    email: 'john@example.com', 
    role: 'admin' 
  },
  { 
    name: 'Jane Doe', 
    email: 'jane@example.com', 
    role: 'member' 
  },
];

async function seedUsers() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected');

    // Sync the User model
    await User.sync({ alter: true });
    console.log('User table ready');

    // Check if users already exist
    const existingCount = await User.count();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing users. Skipping seed.`);
      console.log('If you want to reseed, delete the users first.');
      process.exit(0);
    }

    // Insert default users
    await User.bulkCreate(defaultUsers);
    
    console.log(`✅ Successfully seeded ${defaultUsers.length} users!`);
    
    // Display created users
    const users = await User.findAll();
    console.log('\nCreated users:');
    users.forEach(user => {
      console.log(`  ${user.role === 'admin' ? '👑' : '👤'} ${user.name} - ${user.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();


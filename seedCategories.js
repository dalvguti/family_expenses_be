const { sequelize } = require('./config/database');
const Category = require('./models/Category');

const defaultCategories = [
  { name: 'Groceries', description: 'Food and household items', color: '#27ae60', icon: '🛒' },
  { name: 'Utilities', description: 'Water, electricity, gas, internet', color: '#3498db', icon: '💡' },
  { name: 'Transportation', description: 'Gas, public transport, car maintenance', color: '#e74c3c', icon: '🚗' },
  { name: 'Entertainment', description: 'Movies, games, hobbies', color: '#9b59b6', icon: '🎬' },
  { name: 'Healthcare', description: 'Medical expenses, pharmacy', color: '#e67e22', icon: '🏥' },
  { name: 'Education', description: 'Books, courses, tuition', color: '#1abc9c', icon: '📚' },
  { name: 'Shopping', description: 'Clothing, electronics, misc', color: '#f39c12', icon: '🛍️' },
  { name: 'Dining', description: 'Restaurants, takeout, coffee', color: '#d35400', icon: '🍽️' },
  { name: 'Housing', description: 'Rent, mortgage, repairs', color: '#34495e', icon: '🏠' },
  { name: 'Other', description: 'Miscellaneous expenses', color: '#95a5a6', icon: '📌' },
];

async function seedCategories() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected');

    // Sync the Category model
    await Category.sync({ alter: true });
    console.log('Category table ready');

    // Check if categories already exist
    const existingCount = await Category.count();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing categories. Skipping seed.`);
      console.log('If you want to reseed, delete the categories first.');
      process.exit(0);
    }

    // Insert default categories
    await Category.bulkCreate(defaultCategories);
    
    console.log(`✅ Successfully seeded ${defaultCategories.length} categories!`);
    
    // Display created categories
    const categories = await Category.findAll();
    console.log('\nCreated categories:');
    categories.forEach(cat => {
      console.log(`  ${cat.icon} ${cat.name} - ${cat.color}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();


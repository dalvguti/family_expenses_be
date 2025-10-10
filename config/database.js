const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'gutilops_marriage_billing',
  process.env.DB_USER || 'gutilops_marriage_billing_usr',
  process.env.DB_PASSWORD || 'rzu{FsmR&2Yy',
  {
    host: process.env.DB_HOST || 'gutilopsa.com',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL Connected: ${process.env.DB_HOST || 'localhost'}`);
    
    // Sync models with database
    // In production, use migrations instead of sync
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Database synchronized');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

const Expense = require('../models/Expense');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Public
exports.getExpenses = async (req, res) => {
  try {
    const { category, paidBy, startDate, endDate, limit, sort, transactionType } = req.query;
    
    // Build filter object
    const where = {};
    
    if (category) {
      where.category = { [Op.like]: `%${category}%` };
    }
    
    if (paidBy) {
      where.paidBy = { [Op.like]: `%${paidBy}%` };
    }
    
    if (transactionType) {
      where.transactionType = transactionType;
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    // Build order
    let order = [['date', 'DESC']];
    if (sort) {
      const sortFields = sort.split(',').map(field => {
        if (field.startsWith('-')) {
          return [field.substring(1), 'DESC'];
        }
        return [field, 'ASC'];
      });
      order = sortFields;
    }

    // Build query options
    const queryOptions = {
      where,
      order,
    };
    
    if (limit) {
      queryOptions.limit = parseInt(limit);
    }

    const expenses = await Expense.findAll(queryOptions);

    res.json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Public
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Public
exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Public
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    await expense.update(req.body);

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Public
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    await expense.destroy();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Public
exports.getExpenseStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Total expenses
    const totalExpensesResult = await Expense.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      where: { transactionType: 'expense' },
      raw: true,
    });

    // Total earnings
    const totalEarningsResult = await Expense.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      where: { transactionType: 'earning' },
      raw: true,
    });

    // Current month expenses
    const currentMonthExpensesResult = await Expense.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      where: {
        date: { [Op.gte]: currentMonthStart },
        transactionType: 'expense',
      },
      raw: true,
    });

    // Current month earnings
    const currentMonthEarningsResult = await Expense.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      where: {
        date: { [Op.gte]: currentMonthStart },
        transactionType: 'earning',
      },
      raw: true,
    });

    // Expenses by category
    const expensesByCategory = await Expense.findAll({
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { transactionType: 'expense' },
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      raw: true,
    });

    // Earnings by category
    const earningsByCategory = await Expense.findAll({
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { transactionType: 'earning' },
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      raw: true,
    });

    const totalExpenses = parseFloat(totalExpensesResult?.total || 0);
    const totalEarnings = parseFloat(totalEarningsResult?.total || 0);
    const currentMonthExpenses = parseFloat(currentMonthExpensesResult?.total || 0);
    const currentMonthEarnings = parseFloat(currentMonthEarningsResult?.total || 0);

    res.json({
      success: true,
      totalExpenses,
      totalEarnings,
      netBalance: totalEarnings - totalExpenses,
      currentMonthExpenses,
      currentMonthEarnings,
      currentMonthNet: currentMonthEarnings - currentMonthExpenses,
      expensesByCategory: expensesByCategory.map(cat => ({
        category: cat.category,
        total: parseFloat(cat.total),
        count: parseInt(cat.count),
      })),
      earningsByCategory: earningsByCategory.map(cat => ({
        category: cat.category,
        total: parseFloat(cat.total),
        count: parseInt(cat.count),
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

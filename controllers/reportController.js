const Expense = require('../models/Expense');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// @desc    Get monthly report
// @route   GET /api/reports/monthly
// @access  Public
exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Please provide year and month',
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get all expenses for the month
    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      order: [['date', 'ASC']],
    });

    // Total expenses
    const totalExpensesResult = await Expense.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        transactionType: 'expense',
      },
      raw: true,
    });

    // Total earnings
    const totalEarningsResult = await Expense.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
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
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        transactionType: 'expense',
      },
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
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        transactionType: 'earning',
      },
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      raw: true,
    });

    // By person (expenses)
    const expensesByPerson = await Expense.findAll({
      attributes: [
        'paidBy',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        transactionType: 'expense',
      },
      group: ['paidBy'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      raw: true,
    });

    // By person (earnings)
    const earningsByPerson = await Expense.findAll({
      attributes: [
        'paidBy',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        transactionType: 'earning',
      },
      group: ['paidBy'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      raw: true,
    });

    const totalExpenses = parseFloat(totalExpensesResult?.total || 0);
    const totalEarnings = parseFloat(totalEarningsResult?.total || 0);

    res.json({
      success: true,
      totalExpenses,
      totalEarnings,
      netBalance: totalEarnings - totalExpenses,
      expenseCount: parseInt(totalExpensesResult?.count || 0),
      earningCount: parseInt(totalEarningsResult?.count || 0),
      transactions: expenses,
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
      expensesByPerson: expensesByPerson.map(person => ({
        paidBy: person.paidBy,
        total: parseFloat(person.total),
        count: parseInt(person.count),
      })),
      earningsByPerson: earningsByPerson.map(person => ({
        paidBy: person.paidBy,
        total: parseFloat(person.total),
        count: parseInt(person.count),
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get yearly report
// @route   GET /api/reports/yearly
// @access  Public
exports.getYearlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    
    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide year',
      });
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Monthly breakdown for expenses
    const monthlyExpenses = await Expense.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        transactionType: 'expense',
      },
      group: [sequelize.fn('MONTH', sequelize.col('date'))],
      order: [[sequelize.fn('MONTH', sequelize.col('date')), 'ASC']],
      raw: true,
    });

    // Monthly breakdown for earnings
    const monthlyEarnings = await Expense.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        transactionType: 'earning',
      },
      group: [sequelize.fn('MONTH', sequelize.col('date'))],
      order: [[sequelize.fn('MONTH', sequelize.col('date')), 'ASC']],
      raw: true,
    });

    // Combine monthly data
    const monthlyBreakdown = [];
    for (let month = 1; month <= 12; month++) {
      const expenseData = monthlyExpenses.find(e => parseInt(e.month) === month);
      const earningData = monthlyEarnings.find(e => parseInt(e.month) === month);
      const expenses = parseFloat(expenseData?.total || 0);
      const earnings = parseFloat(earningData?.total || 0);
      
      monthlyBreakdown.push({
        month,
        expenses,
        earnings,
        netBalance: earnings - expenses,
        expenseCount: parseInt(expenseData?.count || 0),
        earningCount: parseInt(earningData?.count || 0),
      });
    }

    res.json({
      success: true,
      monthlyBreakdown,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

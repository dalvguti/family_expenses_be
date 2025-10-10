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

    // Total and count
    const totalResult = await Expense.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      raw: true,
    });

    // By category
    const byCategory = await Expense.findAll({
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
      },
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      raw: true,
    });

    // By person
    const byPerson = await Expense.findAll({
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
      },
      group: ['paidBy'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      raw: true,
    });

    res.json({
      success: true,
      total: parseFloat(totalResult?.total || 0),
      count: parseInt(totalResult?.count || 0),
      expenses,
      byCategory: byCategory.map(cat => ({
        category: cat.category,
        total: parseFloat(cat.total),
        count: parseInt(cat.count),
      })),
      byPerson: byPerson.map(person => ({
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

    // Monthly breakdown
    const monthlyBreakdown = await Expense.findAll({
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
      },
      group: [sequelize.fn('MONTH', sequelize.col('date'))],
      order: [[sequelize.fn('MONTH', sequelize.col('date')), 'ASC']],
      raw: true,
    });

    res.json({
      success: true,
      monthlyBreakdown: monthlyBreakdown.map(item => ({
        month: parseInt(item.month),
        total: parseFloat(item.total),
        count: parseInt(item.count),
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

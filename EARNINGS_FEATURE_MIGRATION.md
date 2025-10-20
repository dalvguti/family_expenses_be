# Earnings Feature Migration Guide

## Overview
This application has been enhanced to track both **expenses** and **earnings**, allowing you to manage your complete financial picture with income and spending in one place.

## What's New

### Backend Changes
- **Database Schema**: Added `transactionType` field (ENUM: 'expense' or 'earning')
- **Enhanced Statistics**: Separate tracking for expenses, earnings, and net balance
- **Improved Reports**: Detailed breakdowns of both income and spending

### Frontend Changes
- **Transaction Type Selector**: Choose between expense or earning when creating transactions
- **Visual Indicators**: Color-coded display (red for expenses, green for earnings)
- **Enhanced Dashboard**: Shows net balance, total earnings, and total expenses
- **Updated Reports**: Separate sections for expenses and earnings by category and person

## Migration Steps

### 1. Database Migration

Run the migration script to add the new column to your database:

```bash
cd marriage_billing_backend
node migrations/add_transaction_type.js
```

This script will:
- Add the `transactionType` column to the expenses table
- Set all existing records to 'expense' (default)
- Add an index for better performance

### 2. Restart Backend Server

After running the migration, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
npm start
# or
node server.js
```

### 3. Clear Browser Cache (Optional)

If you experience any issues with the frontend:
- Clear your browser cache
- Do a hard refresh (Ctrl+F5 or Cmd+Shift+R)

## Features Overview

### Transaction Form
- Select transaction type: **Expense** 💸 or **Earning** 💰
- All other fields remain the same (description, amount, category, date, person)

### Transaction List
- Filter by transaction type
- Color-coded rows (light red for expenses, light green for earnings)
- Amount shows with +/- prefix

### Dashboard
- **Net Balance**: Shows surplus or deficit
- **Total Earnings**: Sum of all income
- **Total Expenses**: Sum of all spending
- **Monthly Statistics**: Current month breakdown
- **Recent Transactions**: Shows both expenses and earnings

### Reports
- **Monthly Reports**: Separate breakdowns for expenses and earnings
- **By Category**: View spending and income by category
- **By Person**: See who contributed what in both expenses and earnings
- **Export**: CSV export includes transaction type

## Database Schema Changes

### Before
```sql
CREATE TABLE expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  paidBy VARCHAR(255) NOT NULL,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### After
```sql
CREATE TABLE expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  paidBy VARCHAR(255) NOT NULL,
  transactionType ENUM('expense', 'earning') NOT NULL DEFAULT 'expense',
  createdAt DATETIME,
  updatedAt DATETIME,
  INDEX idx_transactionType (transactionType)
);
```

## API Changes

### Updated Endpoints

#### GET /api/expenses/stats
**New Response Format:**
```json
{
  "success": true,
  "totalExpenses": 5000.00,
  "totalEarnings": 7000.00,
  "netBalance": 2000.00,
  "currentMonthExpenses": 1200.00,
  "currentMonthEarnings": 1500.00,
  "currentMonthNet": 300.00,
  "expensesByCategory": [...],
  "earningsByCategory": [...]
}
```

#### GET /api/reports/monthly
**New Response Format:**
```json
{
  "success": true,
  "totalExpenses": 1200.00,
  "totalEarnings": 1500.00,
  "netBalance": 300.00,
  "expenseCount": 25,
  "earningCount": 5,
  "transactions": [...],
  "expensesByCategory": [...],
  "earningsByCategory": [...],
  "expensesByPerson": [...],
  "earningsByPerson": [...]
}
```

## Backward Compatibility

All existing expenses will automatically be treated as **expenses** (not earnings). The migration sets the default value to ensure no data is lost.

## Testing

After migration, test the following:
1. ✅ View existing transactions (should all show as expenses)
2. ✅ Create a new expense
3. ✅ Create a new earning
4. ✅ View dashboard statistics
5. ✅ Generate monthly report
6. ✅ Filter by transaction type
7. ✅ Export to CSV

## Troubleshooting

### Migration Fails
- Check database connection in `config/database.js`
- Ensure you have ALTER TABLE permissions
- Check if column already exists

### Frontend Not Updating
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Check browser console for errors

### Stats Showing Zero
- Ensure migration completed successfully
- Check that records have transactionType set
- Restart backend server

## Support

If you encounter any issues:
1. Check the migration script output for errors
2. Verify database schema with: `DESCRIBE expenses;`
3. Check backend logs for API errors
4. Verify frontend is loading the updated code

## Future Enhancements

Potential future features:
- Recurring earnings/expenses
- Budget planning with earnings vs expenses
- Graphical charts showing income vs spending trends
- Categories specific to earnings vs expenses
- Tags for better organization


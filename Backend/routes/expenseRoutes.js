const express = require('express');
const expenseRoute = express.Router();
const protect = require('../middleware/auth');
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
} = require('../controllers/expenseController');

expenseRoute.use(protect); // every route below requires a valid JWT

expenseRoute.get("/monthly-summary",getMonthlySummary);
expenseRoute.post('/', createExpense);
expenseRoute.get('/', getExpenses);
expenseRoute.get('/:id', getExpenseById);
expenseRoute.put('/:id', updateExpense);
expenseRoute.delete('/:id', deleteExpense);

module.exports = expenseRoute;
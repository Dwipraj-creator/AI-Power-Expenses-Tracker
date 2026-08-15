const express = require('express');
const budgetRoute = express.Router();
const protect = require('../middleware/auth');
const { getBudgetStatus } = require('../controllers/budgetController');

budgetRoute.get('/status', protect, getBudgetStatus);

module.exports = budgetRoute;
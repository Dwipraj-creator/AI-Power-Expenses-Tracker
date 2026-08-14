const express = require('express');
const aiRoute = express.Router();
const protect = require('../middleware/auth');
const { parseExpense } = require('../controllers/aiController');

aiRoute.post('/parse-expense', protect, parseExpense);

module.exports = aiRoute;
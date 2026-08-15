const express = require('express');
const userRoute = express.Router();
const protect = require('../middleware/auth');
const { updateBudget } = require('../controllers/userController');

userRoute.put('/budget', protect, updateBudget);

module.exports = userRoute;
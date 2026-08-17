const Expense = require('../models/Expense');
const User = require('../models/User');
const { sendBudgetAlertEmail } = require('../utils/email');

// GET /api/budget/status
exports.getBudgetStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const monthlyBudget = user.monthlyBudget || 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const totalDaysInMonth = endOfMonth.getDate();
    const daysElapsed = now.getDate();
    const daysRemaining = totalDaysInMonth - daysElapsed;

    const expenses = await Expense.find({
      userId: req.userId,
      timestamp: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const spentSoFar = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (monthlyBudget === 0) {
      return res.json({
        monthlyBudget: 0,
        spentSoFar,
        message: 'No monthly budget set',
      });
    }

    // --- Pace-based calculation ---
    const monthProgressPct = (daysElapsed / totalDaysInMonth) * 100; // how far through the month we are
    const budgetUsedPct = (spentSoFar / monthlyBudget) * 100; // how much budget is used

    // "Ideal" spend at this point in the month, if spreading evenly
    const idealSpendByNow = (monthlyBudget / totalDaysInMonth) * daysElapsed;
    const paceDifference = spentSoFar - idealSpendByNow; // positive = overspending pace, negative = under

    // Projected total spend if current daily rate continues for the rest of the month
    const dailyRate = daysElapsed > 0 ? spentSoFar / daysElapsed : 0;
    const projectedTotal = dailyRate * totalDaysInMonth;

    // Determine status level
    let status = 'on-track';
    if (projectedTotal > monthlyBudget * 1.1) {
      status = 'danger'; // projected to significantly overshoot
    } else if (projectedTotal > monthlyBudget) {
      status = 'warning'; // projected to slightly overshoot
    }

    if (status === 'danger' || status === 'warning') {
  const ALERT_COOLDOWN_HOURS = 12;
  const now = new Date();
  const lastAlert = user.lastBudgetAlertAt;
  const hoursSinceLastAlert = lastAlert ? (now - lastAlert) / (1000 * 60 * 60) : Infinity;

  if (hoursSinceLastAlert >= ALERT_COOLDOWN_HOURS) {
    const subject = status === 'danger' ? '🚨 Budget Alert from Jervis' : '⚠️ Budget Warning from Jervis';
    const message =
      status === 'danger'
        ? `You're on pace to spend ₹${Math.round(projectedTotal)} this month — over your ₹${monthlyBudget} budget!`
        : `You're spending faster than planned. Projected ₹${Math.round(projectedTotal)} by month end.`;

    sendBudgetAlertEmail(user.email, subject, message);
    user.lastBudgetAlertAt = now;
    await user.save();
  }
}

    res.json({
      monthlyBudget,
      spentSoFar: Math.round(spentSoFar),
      daysElapsed,
      daysRemaining,
      totalDaysInMonth,
      monthProgressPct: Math.round(monthProgressPct),
      budgetUsedPct: Math.round(budgetUsedPct),
      idealSpendByNow: Math.round(idealSpendByNow),
      paceDifference: Math.round(paceDifference),
      projectedTotal: Math.round(projectedTotal),
      status, // 'on-track' | 'warning' | 'danger'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
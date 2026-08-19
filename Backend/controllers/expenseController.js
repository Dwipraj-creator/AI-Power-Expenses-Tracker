const Expense = require('../models/Expense');

// POST /api/expenses
exports.createExpense = async (req, res) => {
  try {
    const { amount, category, description, timestamp, inputMethod, rawText } = req.body;

    if (!amount || !category || !inputMethod) {
      return res.status(400).json({ message: 'amount, category, and inputMethod are required' });
    }

    const expense = await Expense.create({
      userId: req.userId,
      amount,
      category,
      description,
      timestamp: timestamp || Date.now(), // default handled here if not provided
      inputMethod,
      rawText,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/expenses  (supports optional ?startDate=&endDate=)
exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.userId };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort({ timestamp: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/expenses/:id
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/expenses/monthly-summary
exports.getMonthlySummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    const formatted = summary.map((entry) => ({
      year: entry._id.year,
      month: entry._id.month, // 1-12
      total: entry.total,
      count: entry.count,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
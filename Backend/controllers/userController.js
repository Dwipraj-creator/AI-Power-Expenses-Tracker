const User = require('../models/User');

// PUT /api/users/budget
exports.updateBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;

    if (typeof monthlyBudget !== 'number' || monthlyBudget < 0) {
      return res.status(400).json({ message: 'monthlyBudget must be a non-negative number' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { monthlyBudget },
      { new: true }
    ).select('-password');

    res.json({ id: user._id, name: user.name, email: user.email, monthlyBudget: user.monthlyBudget });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
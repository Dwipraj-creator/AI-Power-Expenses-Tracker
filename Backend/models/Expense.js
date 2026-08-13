const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // speeds up date-range queries scoped to a user
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now, // covers your "default to current time if no date mentioned" rule
    },
    inputMethod: {
      type: String,
      enum: ['voice', 'manual'],
      required: true,
    },
    rawText: {
      type: String, // original spoken/typed sentence, optional debugging aid
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
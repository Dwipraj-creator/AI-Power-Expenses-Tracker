const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // optional — Google-only users won't have one
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // allows multiple docs with no googleId without unique conflicts
    },
    authProviders: {
      type: [String], // e.g. ["local"], ["google"], or both if linked
      default: [],
    },
    monthlyBudget: {
      type: Number,
      default: 0, // used later for budget alerts
    },
  },
  { timestamps: true } // adds createdAt, updatedAt automatically
);

module.exports = mongoose.model('User', userSchema);
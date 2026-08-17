const express = require('express');
const authRoute = express.Router();
const protect = require('../middleware/auth');
const { signup, login ,getMe, updateProfile, changePassword } = require('../controllers/authController');

const passport = require('passport');
const jwt = require('jsonwebtoken');
// ...keep your existing signup/login imports

authRoute.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

authRoute.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // redirect back to frontend with token as a query param
    res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
  }
);

authRoute.get('/me', protect, getMe);

authRoute.post('/signup', signup);
authRoute.post('/login', login);

authRoute.put("/profile",protect,updateProfile)
authRoute.put("/password",protect,changePassword)

module.exports = authRoute;
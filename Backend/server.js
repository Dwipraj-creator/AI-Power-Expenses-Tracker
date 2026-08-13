require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoute = require('./routes/authRoutes');
const session = require('express-session');
const passport = require('./config/passport');
const expenseRoute = require('./routes/expenseRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// session + passport must come BEFORE routes that use passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());

// now routes, after passport is ready
app.use('/api/auth', authRoute);

app.use('/api/expenses', expenseRoute);

app.get('/', (req, res) => {
  res.send('Expense Tracker API running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
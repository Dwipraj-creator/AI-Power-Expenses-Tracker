require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoute = require('./routes/authRoutes');
const session = require('express-session');
const passport = require('./config/passport');
const expenseRoute = require('./routes/expenseRoutes');
const aiRoute = require('./routes/aiRoutes');
const userRoute = require('./routes/userRoutes');
const budgetRoute = require('./routes/budgetRoutes');

const app = express();

connectDB();

// --- CORS: allow both local dev and deployed frontend ---
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean); // removes undefined if FRONTEND_URL isn't set yet

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// session + passport must come BEFORE routes that use passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);
app.use(passport.initialize());

// now routes, after passport is ready
app.use('/api/auth', authRoute);
app.use('/api/expenses', expenseRoute);
app.use('/api/ai', aiRoute);
app.use('/api/users', userRoute);
app.use('/api/budget', budgetRoute);

app.get('/', (req, res) => {
  res.send('Expense Tracker API running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
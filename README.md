# Jervis — AI-Powered Expense Tracker

Jervis is a full-stack, voice-enabled expense tracker built on the MERN stack. Log expenses by typing them or by talking to Jervis like a personal assistant — say "Jarvis, I spent 500 on a shirt," confirm what it heard, and it's saved. Includes AI-parsed voice entry, pace-based budget alerts (email, browser notification, in-app toast), a calendar heatmap of spending, and monthly history.

**Live app:** https://ai-power-expenses-tracker.vercel.app
**Backend API:** https://ai-power-expenses-tracker.onrender.com

---

## Features

### Authentication
- Email/password signup & login (bcrypt-hashed passwords, JWT sessions)
- Google OAuth (Sign in with Google), with automatic account linking if the same email is used for both methods

### Expense Tracking
- Manual expense entry (amount, category, description)
- Full CRUD — create, read, update, delete
- Every expense scoped to the logged-in user (`userId`), no cross-user data leakage

### Voice Assistant ("Jarvis")
- Wake-word activation — tap the orb, then say **"Jarvis"** to start a command, no button-mashing required
- Continuous listening with automatic silence-based cutoff (stops capturing ~1.8s after you stop talking)
- Auto-timeout after 60s of inactivity so the mic doesn't listen forever
- Natural language parsing via **Gemini** (`gemini-2.5-flash-lite`) — extracts amount, category, description, and date from a spoken sentence, defaulting to the current timestamp if no date is mentioned
- On-screen preview of the parsed expense before anything is saved
- Voice confirmation — say **"save"** to confirm or **"cancel"** to redo, with an on-screen Save/Cancel button as a fallback
- Spoken responses via the browser's Text-to-Speech (acknowledgment on wake, read-back of the parsed expense, and confirmation once saved)

### Budget & Alerts
- Set a monthly budget from Settings
- **Pace-based** status calculation — compares how far through the month you are against how much of your budget you've used, and projects your total spend at the current daily rate (not just a flat "80% used" threshold)
- Visual gauge with an "ideal pace" marker line
- Alerts fire when status crosses into `warning` or `danger`:
  - In-app toast notification
  - Browser push notification (if permission granted)
  - Email alert (via Gmail SMTP / Nodemailer), with a 12-hour cooldown to avoid spam

### Dashboard & Insights
- 7-day spend trend (line chart)
- Top spending categories (bar chart)
- Total spent, transaction count
- Calendar page — heatmap or amount view of daily spending, click a day to see that day's transactions
- History page — month-by-month totals with month-over-month % change, click through to that month on the calendar

### Settings
- Update profile name
- Update monthly budget
- Change password (with current-password verification; correctly blocked for Google-only accounts)

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS v4
- `react-router-dom` — routing
- `axios` — API calls, with a request interceptor that auto-attaches the JWT
- `recharts` — charts
- `lucide-react` — icons
- Web Speech API (`SpeechRecognition` + `SpeechSynthesis`) — voice input/output, native browser APIs, no external SDK

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- `bcryptjs` — password hashing
- `jsonwebtoken` — JWT auth
- `passport` + `passport-google-oauth20` — Google OAuth
- `express-session` — required transiently by Passport's OAuth handshake
- `@google/generative-ai` — Gemini API for voice-to-structured-data parsing
- `nodemailer` — email alerts via Gmail SMTP

**Infrastructure**
- MongoDB Atlas — database
- Render — backend hosting
- Vercel — frontend hosting

---

## Project Structure

```
├── Backend/
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── passport.js          # Google OAuth strategy
│   ├── controllers/
│   │   ├── authController.js    # signup, login, /me, profile, password
│   │   ├── expenseController.js # expense CRUD + monthly summary
│   │   ├── aiController.js      # Gemini expense parsing
│   │   ├── userController.js    # budget update
│   │   └── budgetController.js  # pace-based budget status + alert trigger
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── models/
│   │   ├── User.js
│   │   └── Expense.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── userRoutes.js
│   │   └── budgetRoutes.js
│   ├── utils/
│   │   └── email.js             # Nodemailer budget alert sender
│   ├── server.js
│   └── .env
│
└── Frontend/
    ├── public/
    │   └── vercel.json           # SPA rewrite rule (see Deployment notes)
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # axios instance with auth interceptor
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── VoiceOrb.jsx      # animated voice assistant orb
    │   │   ├── Toast.jsx         # budget alert toast
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useWakeWord.js    # wake-word + speech recognition state machine
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── OAuthSuccess.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Calendar.jsx
    │   │   ├── History.jsx
    │   │   └── Settings.jsx
    │   ├── utils/
    │   │   ├── speak.js          # text-to-speech wrapper
    │   │   └── notify.js         # browser notification wrapper
    │   ├── App.jsx
    │   ├── index.css             # Tailwind + custom keyframes (grid, orb, glow, float, ray, slide-up)
    │   └── main.jsx
    ├── vercel.json
    └── .env
```

---

## Environment Variables

### Backend (`Backend/.env`)

```env
PORT=5000
NODE_ENV=production

MONGO_URI=your_mongodb_atlas_connection_string

JWT_SECRET=long_random_string
SESSION_SECRET=another_long_random_string

GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.onrender.com/api/auth/google/callback

GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=your_gmail_address@gmail.com
EMAIL_APP_PASSWORD=your_16_char_gmail_app_password

FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Frontend (`Frontend/.env`)

```env
VITE_API_URL=https://your-backend-domain.onrender.com/api
```

> **Vite note:** any frontend env var must be prefixed with `VITE_` or Vite will not expose it to the browser bundle. Env vars are baked in at **build time** — changing them on Vercel requires a fresh deploy to take effect, not just a save.

---

## Local Setup

### Backend

```bash
cd Backend
npm install
# create .env with the variables above (use http://localhost:5000/api/auth/google/callback
# and http://localhost:5173 for GOOGLE_CALLBACK_URL / FRONTEND_URL locally)
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
# create .env with VITE_API_URL=http://localhost:5000/api
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

---

## Google OAuth Setup

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application)
2. Add **Authorized redirect URIs** for both environments:
   - `http://localhost:5000/api/auth/google/callback`
   - `https://your-backend-domain.onrender.com/api/auth/google/callback`
3. Copy the Client ID and Secret into your backend `.env`

If you ever see `Error 400: redirect_uri_mismatch`, double-check you're editing the **same OAuth client** whose Client ID matches `GOOGLE_CLIENT_ID` in your `.env` — it's easy to end up with multiple clients in one project and edit the wrong one.

---

## Gemail App Password Setup (for budget alert emails)

1. Enable 2-Step Verification on the Google account you want to send from
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate one for "Other (Custom name)" → name it e.g. `Jervis Backend`
4. Use the 16-character password as `EMAIL_APP_PASSWORD` (not your real Gmail password)

---

## Deployment

**Backend — Render**
- Connect the `Backend/` repo, set build command `npm install`, start command `node server.js`
- Add all backend env vars above in Render's Environment tab
- Bind to `0.0.0.0` (already handled in `server.js`) — required for Render to route external traffic
- Free tier spins down after inactivity; the first request after idle takes ~30–60s to wake up

**Frontend — Vercel**
- Connect the `Frontend/` repo
- Add `VITE_API_URL` in Vercel's Environment Variables (Production scope)
- **Required:** add a `vercel.json` at the frontend root with a SPA rewrite rule, or client-side routes like `/oauth-success` will 404 on direct navigation (e.g. after the OAuth redirect):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**CORS**
Backend CORS allows both `http://localhost:5173` and `process.env.FRONTEND_URL` simultaneously, so local dev and production both work without reconfiguring anything.

**Database**
MongoDB Atlas → Network Access → allow `0.0.0.0/0` (or your host's specific IP ranges) so the deployed backend can reach the database.

---

## API Overview

All routes except signup/login/Google OAuth require `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Email/password signup |
| POST | `/api/auth/login` | Email/password login |
| GET | `/api/auth/google` | Start Google OAuth flow |
| GET | `/api/auth/google/callback` | Google OAuth redirect target |
| GET | `/api/auth/me` | Current user info |
| PUT | `/api/auth/profile` | Update name |
| PUT | `/api/auth/password` | Change password |
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses` | List expenses (`?startDate=&endDate=`) |
| GET | `/api/expenses/monthly-summary` | Totals grouped by month |
| GET | `/api/expenses/:id` | Get one expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| POST | `/api/ai/parse-expense` | Parse raw speech text into structured expense data |
| PUT | `/api/users/budget` | Set monthly budget |
| GET | `/api/budget/status` | Pace-based budget status (also triggers alert emails) |

---

## Known Limitations

- Voice recognition uses the browser's built-in `SpeechRecognition`, which requires an active internet connection (Chrome sends audio to Google's servers for transcription) and only works reliably in Chromium-based browsers.
- The wake-word detector is a keyword-match on continuous transcription, not a true low-power local wake-word engine — the mic is actively transcribing (not just pattern-matching) the entire time a session is active.
- Gemini free-tier has request-per-minute rate limits; rapid repeated voice commands can occasionally hit a 429.
- Render's free tier cold-starts after inactivity (~30–60s first-request delay).
- Bank statement import (CSV/PDF) and live bank account linking are not implemented — scoped out as a future stretch goal.

---

## Roadmap / Ideas for Future Work

- CSV / PDF bank statement import (Gemini-assisted parsing for PDFs)
- Recurring expenses
- Per-category sub-budgets
- Monthly summary email digest
- Natural-language expense queries ("how much did I spend on food last month?")
// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();

        // Case 1: user already signed up via Google before
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // Case 2: user exists via email (local signup) — link accounts
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          if (!user.authProviders.includes('google')) {
            user.authProviders.push('google');
          }
          await user.save();
          return done(null, user);
        }

        // Case 3: brand new user via Google
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          authProviders: ['google'],
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// required by passport even though we're not using full sessions for API auth
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;
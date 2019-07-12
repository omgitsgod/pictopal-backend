const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: `https://pictopal-backend.herokuapp.com/auth/google/callback`,
      redirectUri: 'postmessage'
    },
    (accessToken, refreshToken, profile, done) => {
      const userData = {
        email: profile.emails[0].value,
        name: profile.displayName,
        token: accessToken
      };
      done(null, userData);
    }
  )
);

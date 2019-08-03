const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const User = require('../src/models/user')

passport.serializeUser((user, done) => {
  console.log("Serializer : ", user)
  done(null, user)
});

passport.deserializeUser((user, done) => done(null, user));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: `${process.env.HOST}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile.id);
      const userData = {
        email: profile.emails[0].value,
        name: profile.displayName,
        photo: profile.photos[0].value,
        token: accessToken,
        oauthID: profile.id
      };
      done(null, userData);
    }
  )
);

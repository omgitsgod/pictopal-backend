const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const User = require('../src/models/user')

passport.serializeUser((user, done) => {
  console.log("Serializer : ", user._id)
  done(null, user._id)
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    console.log(user);
    if (!err) {
      done(null, user);
    } else {
      done(err, null);
    }
  })
  done(null, user)
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: `${process.env.HOST}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile.id);
      User.findOne({oauthID: profile.id}, (err, user) => {
        if (err){
          console.log(err);
        }
        if (!err && user !==null) {
          done(null, user)
        } else {
          user = new User({
            oauthID: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            photo: profile.photos[0].value,
            token: accessToken,
            created: Date.now()
          })
          user.save((err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("saving user...");
              done(null, user)
            }
          })
        }
      })
  //    const userData = {
  //      email: profile.emails[0].value,
  //      name: profile.displayName,
  //      photo: profile.photos[0].value,
  //      token: accessToken,
  //      oauthID: profile.id
  //    };
  //    done(null, userData);
    }
  )
);

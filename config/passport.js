const GoogleStrategy = require("passport-google-oauth20").Strategy
const Local = require("passport-local").Strategy
const User = require("../models/User")

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshTOken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
        }

        try {
          let user = await User.findOne({ googleId: profile.id })

          if (user) {
            done(null, user)
          } else {
            user = await User.create(newUser)
            done(null, user)
          }
        } catch (err) {
          console.log(err)
        }
      }
    )
  )

  passport.use(
    new Local(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          let user = await User.findOne({ email: email })

          if (!user) {
            return done(null, false, { message: "Incorrect email." })
          }
          if (!user.comparePassword(password, user.password)) {
            return done(null, false, { message: "Incorrect password." })
          }
          return done(null, user)
        } catch (err) {
          console.log(err)
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user))
  })
}

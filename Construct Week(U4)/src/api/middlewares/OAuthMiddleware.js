import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"
import { userData } from "../../models/userModel.js"
import dotenv from "dotenv"

dotenv.config()

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await userData.findOne({ googleId: profile.id })
        if (existingUser) {
            existingUser.accessToken = accessToken
            existingUser.refreshToken = refreshToken
            return done(null, existingUser)
        }

        const newUser = new userData({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            accessToken,
            refreshToken
        })

        await newUser.save()

        done(null, newUser)
    } catch (err) {
        done(err, null)
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(((id, done) => {
    userData.findById(id).then((user) => {
        done(null, user)
    })
}))
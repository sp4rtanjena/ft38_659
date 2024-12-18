import express, { urlencoded } from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import passport from "passport"
import session from "express-session"
import { userRouter } from "./api/routes/userRoutes.js"
import { eventRouter } from "./api/routes/eventRoutes.js"
import "../src/api/middlewares/passport-setup.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT
const DB_URL = process.env.DB_URL

app.use(express.json())
app.use(urlencoded({ extended: true }))



app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(userRouter)
app.use("/event", eventRouter)

mongoose.connect(DB_URL)
    .then(() => {
        console.log("Connected to database!")
        app.listen(PORT, () => {
            console.log(`Server is live on http://localhost:${PORT}`)
        })
    })
    .catch((err) => {
        console.log("Connection to DB Failed:", err)
    })
import express from "express"
import { loginUser, registerUser } from "../controllers/userController.js"
import passport from "passport"

const userRouter = express.Router()

// Register and Login Routes
userRouter.post("/user/register", registerUser)
userRouter.post("/user/login", loginUser)

// Google Auth routes
userRouter.get("/user/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}))

userRouter.get("/user/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "/login"
}), (req, res) => {
    res.redirect("/")
})

export {
    userRouter
}
import express from "express"
import { getUserProfile, loginUser, refreshAccessToken, registerUser } from "../controllers/userController.js"
import passport from "passport"
import { forgotPassword, resetPassword } from "../controllers/forgotController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js"

const userRouter = express.Router()

// Register and Login Routes*
userRouter.post("/user/register", registerUser)
userRouter.post("/user/login", loginUser)
userRouter.post("/user/refresh-token", refreshAccessToken)
userRouter.get("/user/profile", authMiddleware, getUserProfile) //frontend

//Forget and Reset Password *
userRouter.post("/user/forget-password", forgotPassword)
userRouter.post("/user/reset-password/:token", resetPassword)

// Google Auth routes * 
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
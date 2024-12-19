import crypto from "crypto"
import { userData } from "../../models/userModel.js"
import nodemailer from "nodemailer"
import argon2 from "argon2"
import dotenv from "dotenv"

dotenv.config()

const forgotPassword = async (req, res) => {
    const { email } = req.body
    if (!email) return res.status(400).json({ msg: "Please provide an email address" })

    try {
        const user = await userData.findOne({ email })
        if (!user) return res.status(404).json({ msg: "User with this email NOT FOUND." })

        const resetToken = crypto.randomBytes(32).toString("hex")
        const resetTokExp = Date.now() + 3600000

        user.resetPasswordToken = resetToken
        user.resetPassTokExp = resetTokExp

        await user.save()

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: "PASSWORD Reset Request",
            html: `
                <p>Hello ${user.name},</p>
                <br>
                <p>We received a request to reset your password. Please click on the link below to reset your password.</p>
                <br>
                <a href="http://localhost:${process.env.PORT}/user/reset-password/${resetToken}">RESET Password</a>
                <br>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Regards,</p>
                <p>Your App Team</p>
            `
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return res.status(500).json({ msg: "Error sending email.", error: err.message })
            return res.status(200).json({ msg: "Password reset link sent successfully!" })
        })

    } catch (err) {
        return res.status(500).json({ msg: "Error forgotPassword: ", error: err.message })
    }
}

const resetPassword = async (req, res) => {
    const { token } = req.params
    const { newPassword } = req.body
    if (!token || !newPassword) return res.status(400).json({ msg: "Token and new password are required." })

    try {
        const user = await userData.findOne({ resetPasswordToken: token })
        if (!user) return res.status(400).json({ msg: "Invalid or expired token." })

        if (user.resetPassTokExp < Date.now()) return res.status(400).json({ msg: "Token has expired. Please request a new one." })

        const hashPassword = await argon2.hash(newPassword)

        user.password = hashPassword
        user.resetPasswordToken = undefined
        user.resetPassTokExp = undefined

        await user.save()

        return res.status(200).json({ msg: "Password has been reset successfully!" })
    } catch (err) {
        return res.status(500).json({ msg: "Error resetting password.", error: err.message })
    }
}

export {
    forgotPassword,
    resetPassword
}
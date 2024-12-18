import argon2 from "argon2"
import { userData } from "../../models/userModel.js"

const registerUser = async (req, res) => {
    const { username, name, email, password, phone, role } = req.body
    if (!username || !name || !email || !password || !phone) return res.status(400).json({ msg: "Enter all the details to complete sign-up." })

    try {
        const isRegistered = await userData.findOne({ $or: [{ username }, { email }] })
        if (isRegistered) return res.status(406).json({ msg: "Username or email already registered." })

        const hashPassword = await argon2.hash(password)

        const newUser = await userData({
            username,
            name,
            email,
            password: hashPassword,
            phone,
            role,
        })

        await newUser.save()

        return res.status(201).json({ msg: "User Registered Successfully!", newUser })
    } catch (err) {
        return res.status(500).json("Error registerUser", err.message)
    }
}

const loginUser = async (req, res) => {
    const { identifier, password } = req.body
    if (!identifier || !password) return res.status(400).json({ msg: "Insufficient Credentials." })

    try {
        const user = await userData.findOne({ $or: [{ username: identifier }, { email: identifier }] })
        if (!user) return res.status(404).json({ msg: "User NOT FOUND!" })

        const verifyPass = await argon2.verify(user.password, password)
        if (!verifyPass) return res.status(401).json({ msg: "Password does not match." })

        return res.status(200).json({ msg: "User Logged-In Successfully!" })
    } catch (err) {
        return res.status(500).json("Error loginUser", err.message)
    }
}

export {
    registerUser,
    loginUser,
}
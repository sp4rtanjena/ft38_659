import { userData } from "../../models/userModel.js"
import { eventData } from "../../models/eventModel.js"
import dotenv from "dotenv"

dotenv.config()

const checkAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized access" })
    }
    next()
}

const userToAdmin = async (req, res) => {
    const { email, secretKey } = req.body
    if (!email || !secretKey) {
        return res.status(400).json({ message: "Please provide email and secretKey" })
    }

    try {
        const user = await userData.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User NOT FOUND!" })
        }

        if (secretKey !== process.env.ADMIN_SECRET) {
            return res.status(401).json({ message: "Invalid secret key!" })
        }

        user.role = "admin"
        await user.save()

        return res.status(200).json({ message: "User role updated to admin", user })
    } catch (err) {
        return res.status(500).json({ message: "Error updating user role", error: err.message })
    }
}

const adminGetAllUsers = async (req, res) => {
    try {
        const users = await userData.find()
        return res.status(200).json({ users })
    } catch (err) {
        return res.status(500).json({ message: "Error fetching users", error: err.message })
    }
}

const adminGetUserById = async (req, res) => {
    const { userId } = req.params
    try {
        const user = await userData.findById(userId)
        if (!user) return res.status(404).json({ message: "User NOT FOUND!" })
        return res.status(200).json({ user })
    } catch (err) {
        return res.status(500).json({ message: "Error fetching user", error: err.message })
    }
}

const adminUpdateUser = async (req, res) => {
    const { userId } = req.params
    const { name, email, phone, role } = req.body
    if (!name || !email || !phone || !role) return res.status(400).json({ message: "Please provide all details" })

    try {
        const user = await userData.findById(userId)
        if (!user) return res.status(404).json({ message: "User NOT FOUND!" })

        user.name = name
        user.email = email
        user.phone = phone
        user.role = role
        await user.save()

        return res.status(200).json({ message: "User updated successfully", user })
    } catch (err) {
        return res.status(500).json({ message: "Error updating user", error: err.message })
    }
}

const adminDeleteUser = async (req, res) => {
    const { userId } = req.params
    try {
        const user = await userData.findById(userId)
        if (!user) return res.status(404).json({ message: "User NOT FOUND!" })

        await user.remove()
        return res.status(200).json({ message: "User deleted successfully" })
    } catch (err) {
        return res.status(500).json({ message: "Error deleting user", error: err.message })
    }
}

const adminGetAllEvents = async (req, res) => {
    try {
        const events = await eventData.find()
        return res.status(200).json({ events })
    } catch (err) {
        return res.status(500).json({ message: "Error fetching events", error: err.message })
    }
}

const adminGetEventById = async (req, res) => {
    const { eventId } = req.params
    if (!eventId) return res.status(400).json({ message: "Please provide event ID" })

    try {
        const event = await eventData.findById(eventId)
        if (!event) return res.status(404).json({ message: "Event NOT FOUND!" })
        return res.status(200).json({ event })
    } catch (err) {
        return res.status(500).json({ message: "Error fetching event", error: err.message })
    }
}

const adminUpdateEvent = async (req, res) => {
    const { eventId } = req.params
    const { title, description, date, location } = req.body
    if (!title || !description || !date || !location) return res.status(400).json({ message: "Please provide all details" })

    try {
        const event = await eventData.findById(eventId)
        if (!event) return res.status(404).json({ message: "Event NOT FOUND!" })

        event.title = title
        event.description = description
        event.date = date
        event.location = location
        await event.save()

        return res.status(200).json({ message: "Event updated successfully", event })
    } catch (err) {
        return res.status(500).json({ message: "Error updating event", error: err.message })
    }
}

const adminDeleteEvent = async (req, res) => {
    const { eventId } = req.params
    if (!eventId) return res.status(400).json({ message: "Please provide event ID" })

    try {
        const event = await eventData.findById(eventId)
        if (!event) return res.status(404).json({ message: "Event NOT FOUND!" })

        await event.remove()
        return res.status(200).json({ message: "Event deleted successfully" })
    } catch (err) {
        return res.status(500).json({ message: "Error deleting event", error: err.message })
    }
}

export {
    userToAdmin,
    adminGetAllUsers,
    adminGetUserById,
    adminUpdateUser,
    adminDeleteUser,
    adminGetAllEvents,
    adminGetEventById,
    adminUpdateEvent,
    adminDeleteEvent,
    checkAdmin
}

import { eventData } from "../../models/eventModel.js"
import { createEvent, getAuthClient } from "../services/calendarService.js"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import mongoose from "mongoose"
import axios from "axios"
import { userData } from "../../models/userModel.js"

dotenv.config()

const uploadMediaToFilestack = async (media) => {
    const uploadedMedia = []

    if (!Array.isArray(media) || media.length === 0) {
        throw new Error("No media files provided.")
    }

    for (let file of media) {
        try {
            console.log("Uploading file:", file)

            if (!file.buffer) {
                throw new Error("File buffer is missing.")
            }

            const formData = new FormData()
            formData.append("fileUpload", file.buffer, file.originalname)

            const result = await axios.post("https://www.filestackapi.com/api/store/S3", formData, {
                headers: {
                    "Filestack-Api-Key": process.env.FILESTACK_API_KEY,
                    "Content-Type": `multipart/form-data boundary=${formData._boundary}`,
                },
            })

            const fileUrl = result.data.url

            uploadedMedia.push({
                url: fileUrl,
                type: file.mimetype.startsWith("image") ? "image" : "file",
            })
        } catch (err) {
            console.error("Error uploading media:", err)
            throw new Error(`Error uploading media: ${err.message || err}`)
        }
    }

    return uploadedMedia
}

const createEventInDatabase = async (req, res) => {
    const { title, description, startTime, endTime, timeZone, location, media, invitees } = req.body

    if (!title || !startTime || !timeZone || !location) {
        return res.status(400).json({ msg: "Missing required fields" })
    }

    // console.log("User:", req.user.id)
    // console.log("Access Token:", req.user ? req.user.accessToken : "No user")

    if (!req.user && !req.user.accessToken) {
        return res.status(401).json({ msg: "Unauthorized" })
    }

    try {
        if (!Array.isArray(invitees)) {
            return res.status(400).json({ msg: "Invitees should be an array" })
        }

        const inviteeObjectIds = invitees.map((id) => new mongoose.Types.ObjectId(id))

        if (inviteeObjectIds.length !== 0) {
            const users = await userData.find({ _id: { $in: inviteeObjectIds } })
            for (let user of users) {
                if (user.email) {
                    await sendInvitationEmail(user.email, { title, description, location, dateTime: { start: { dateTime: startTime }, end: { dateTime: endTime || startTime } } })
                }
            }
        }

        let uploadedMedia = []
        if (media && Array.isArray(media)) {
            uploadedMedia = uploadMediaToFilestack(media)
        }

        let eventEndTime = endTime
        if (!endTime) {
            const startDate = new Date(startTime)
            startDate.setHours(startDate.getHours() + 3)
            eventEndTime = startDate.toISOString()
        }

        const newEvent = new eventData({
            title,
            desc: description || "",
            dateTime: {
                summary: title,
                start: {
                    dateTime: startTime,
                    timeZone: timeZone,
                },
                end: {
                    dateTime: eventEndTime,
                    timeZone: timeZone,
                },
            },
            location: {
                address: location,
            },
            media: uploadedMedia,
            invitees: inviteeObjectIds,
        })

        // Use Google OAuth2 client with the correct Google access token
        if (req.user.accessToken) {
            const oauth2Client = getAuthClient()
            oauth2Client.setCredentials({ access_token: req.user.accessToken })
            const googleEvent = await createEvent(oauth2Client, {
                summary: title,
                description,
                start: {
                    dateTime: startTime,
                    timeZone: timeZone,
                },
                end: {
                    dateTime: eventEndTime,
                    timeZone: timeZone,
                },
                location,
            })
        }

        await newEvent.location.setCoordinates()
        await newEvent.save()

        const user = await userData.findById(req.user.id)
        if (user) {
            user.createdEvents.push(newEvent.id)
            await user.save()
        }

        return res.status(201).json({ msg: "Event created successfully!", newEvent })
    } catch (err) {
        return res.status(500).json({ msg: "Error creating event", error: err.message })
    }
}

const getAllEvents = async (req, res) => {
    try {
        const events = await eventData.find()
        if (events.length === 0) {
            return res.status(404).json({ msg: "No Events Created yet." })
        }
        return res.status(200).json({ events })
    } catch (err) {
        return res.status(500).json({ msg: "Error creating event", error: err.message })
    }

}

const getEvent = async (req, res) => {
    const { id } = req.params

    try {
        const event = await eventData.findById(id).populate("rsvpStatus.user")
        if (!event) {
            return res.status(404).json({ msg: "Event not found." })
        }

        const eventUrl = process.env.WEBSITE_URL + `/event/${event._id}`
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${event.location.lat},${event.location.lng}`

        return res.status(200).json({ event, eventUrl, mapUrl })
    } catch (err) {
        return res.status(500).json({ msg: "Error fetching event", error: err.message })
    }
}

const getRSVPs = async (req, res) => {
    const { eventId } = req.params

    try {
        const event = await eventData.findById(eventId).populate("rsvpStatus.user")
        if (!event) return res.status(404).json({ msg: "Event not found" })

        return res.status(200).json({ rsvpStatus: event.rsvpStatus })
    } catch (err) {
        return res.status(500).json({ msg: "Error fetching RSVPs", error: err.message })
    }
}

const updateEventInDatabase = async (req, res) => {
    const { id } = req.params
    const { title, description, startTime, endTime, timeZone, location, media, invitees } = req.body

    if (!title || !startTime || !endTime || !timeZone || !location) {
        return res.status(400).json({ msg: "Missing required fields" })
    }

    if (!req.user && !req.user.accessToken) {
        return res.status(401).json({ msg: "Unauthorized" })
    }

    try {
        const event = await eventData.findById(id)
        if (!event) {
            return res.status(404).json({ msg: "Event not found" })
        }

        event.title = title || event.title
        event.desc = description || event.desc
        event.dateTime.start.dateTime = startTime || event.dateTime.start.dateTime
        event.dateTime.end.dateTime = endTime || event.dateTime.end.dateTime
        event.dateTime.start.timeZone = timeZone || event.dateTime.start.timeZone
        event.dateTime.end.timeZone = timeZone || event.dateTime.end.timeZone
        event.location.address = location || event.location.address

        if (media && Array.isArray(media)) {
            const uploadedMedia = await uploadMediaToFilestack(media)
            event.media = uploadedMedia
        }

        if (invitees && Array.isArray(invitees)) {
            const inviteeObjectIds = invitees.map((id) => new mongoose.Types.ObjectId(id))
            event.invitees = inviteeObjectIds

            const users = await userData.find({ _id: { $in: inviteeObjectIds } })
            for (let user of users) {
                if (user.email) {
                    await sendInvitationEmail(user.email, event)
                }
            }
        }

        if (req.user.accessToken) {
            const oauth2Client = getAuthClient()
            oauth2Client.setCredentials({ access_token: req.user.accessToken })

            const googleEvent = await createEvent(oauth2Client, {
                summary: title,
                description,
                start: {
                    dateTime: startTime,
                    timeZone: timeZone,
                },
                end: {
                    dateTime: endTime,
                    timeZone: timeZone,
                },
                location,
            })
        }

        await event.save()
        return res.status(200).json({ msg: "Event updated successfully!", event })
    } catch (err) {
        return res.status(500).json({ msg: "Error updating event", error: err.message })
    }
}

const deleteEvent = async (req, res) => {
    const { id } = req.params

    try {
        const event = await eventData.findByIdAndDelete(id)
        if (!event) return res.status(404).json({ msg: "Event not found" })
        return res.status(200).json({ msg: "Event deleted successfully", event })
    }
    catch (err) {
        return res.status(500).json({ msg: "Error deleting event", error: err.message })
    }
}


const updateRSVP = async (req, res) => {
    const { eventId, status } = req.body
    const userId = req.user._id

    if (!["attending", "maybe", "not attending"].includes(status)) {
        return res.status(400).json({ msg: "Invalid RSVP status" })
    }

    try {
        const event = await eventData.findById(eventId)
        if (!event) return res.status(404).json({ msg: "Event not found" })

        const rsvp = event.rsvpStatus.find(rsvp => rsvp.user.toString() === userId.toString())
        if (rsvp) {
            rsvp.status = status
        } else {
            event.rsvpStatus.push({ user: userId, status })
        }

        await event.save()

        if (status === "attending") {
            const user = await userData.findById(userId)
            if (user && user.email) {
                await sendInvitationEmail(user.email, event)
            }
        }

        return res.status(200).json({ msg: "RSVP updated successfully", event })
    } catch (err) {
        return res.status(500).json({ msg: "Error updating RSVP", error: err.message })
    }
}

const sendInvitationEmail = async (toEmail, event) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: toEmail,
        subject: `You"re Invited to ${event.title}`,
        html: `
            <p>Hello,</p>
            <p>You are invited to attend the event "${event.title}" on ${event.dateTime.start.dateTime}.</p>
            <p>For more details, please visit <a href="${process.env.WEBSITE_URL}/event/${event._id}">Eventron</a>.</p>         
            <p>${event.desc}</p>
            <p>Event details:</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${event.location.lat},${event.location.lng}"><strong>Location:</strong> ${event.location}</a>
            <p><strong>Date and Time:</strong> ${event.dateTime.start.dateTime}</p>
            <p>We hope to see you there!</p>
            <p>Best regards,</p>
            <p>The Event Team</p>
        `
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log("Invitation email sent successfully")
    } catch (error) {
        console.error("Error sending email:", error)
        throw new Error("Error sending invitation email")
    }
}


export {
    createEventInDatabase,
    getAllEvents,
    getEvent,
    updateEventInDatabase,
    deleteEvent,
    updateRSVP,
    getRSVPs,
    sendInvitationEmail,
}


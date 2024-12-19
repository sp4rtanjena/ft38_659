import { eventData } from "../../models/eventModel.js"
import { createEvent, getAuthClient } from "../services/calendarService.js"
import nodemailer from "nodemailer"
import { cloudinary } from "../middlewares/cloudinaryConfig.js"
import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config()

const uploadMediaToCloudinary = async (media) => {
    const uploadedMedia = []

    if (!Array.isArray(media) || media.length === 0) {
        throw new Error("No media files provided.")
    }

    for (let file of media) {
        try {
            // console.log("Uploading file:", file)

            if (!file.path) {
                throw new Error("File path is missing.")
            }

            const result = await cloudinary.v2.uploader.upload(file.path, { folder: "event", resource_type: "auto" })
            console.log("Upload result:", result)

            uploadedMedia.push({
                url: result.secure_url,
                type: result.resource_type
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

    if (!title || !startTime || !endTime || !timeZone || !location) {
        return res.status(400).json({ msg: "Missing required fields" })
    }

    if (!req.user || !req.user.accessToken) {
        return res.status(401).json({ msg: "Unauthorized" })
    }

    try {
        const inviteeObjectIds = invitees.map((id) => new mongoose.Types.ObjectId(id))

        let uploadedMedia = []
        if (media && Array.isArray(media)) {
            for (let file of media) {
                if (file.url) {
                    uploadedMedia.push({url: file.url, type: file.type })
                } else if (file.path) {
                    const cloudinaryMedia = await uploadMediaToCloudinary(file)
                    uploadedMedia.push(...cloudinaryMedia)
                }
            }
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
                    dateTime: endTime,
                    timeZone: timeZone,
                },
            },
            location: {
                address: location
            },
            media: uploadedMedia,
            invitees: inviteeObjectIds
        })

        await newEvent.location.setCoordinates()

        await newEvent.save()

        const oauth2Client = getAuthClient()
        oauth2Client.setCredentials({ access_token: req.user.accessToken })
        const googleEvent = await createEvent(oauth2Client, {
            summary: title,
            description: description,
            start: {
                dateTime: startTime,
                timeZone: timeZone,
            },
            end: {
                dateTime: endTime,
                timeZone: timeZone,
            },
            location: location,
        })

        return res.status(201).json({ msg: "Event created successfully!", newEvent, googleEvent })
    } catch (err) {
        return res.status(500).json({ msg: "Error creating event", error: err.message })
    }
}


const getEvent = async (req, res) => {
    const { id } = req.params

    try {
        const event = await eventData.findById(id).populate('invitees').populate('rsvpStatus.user')
        if (!event) {
            return res.status(404).json({ msg: "Event not found." })
        }

        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${event.location.lat},${event.location.lng}`

        return res.status(200).json({ event, mapUrl })
    } catch (err) {
        return res.status(500).json({ msg: "Error fetching event", error: err.message })
    }
}

const updateRSVP = async (req, res) => {
    const { eventId, status } = req.body
    const userId = req.user._id

    if (!['attending', 'maybe', 'not attending'].includes(status)) {
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
        return res.status(200).json({ msg: "RSVP updated successfully", event })
    } catch (err) {
        return res.status(500).json({ msg: "Error updating RSVP", error: err.message })
    }
}

const getRSVPs = async (req, res) => {
    const { eventId } = req.params

    try {
        const event = await eventData.findById(eventId).populate('rsvpStatus.user')
        if (!event) return res.status(404).json({ msg: "Event not found" })

        return res.status(200).json({ rsvpStatus: event.rsvpStatus })
    } catch (err) {
        return res.status(500).json({ msg: "Error fetching RSVPs", error: err.message })
    }
}

const sendInvitations = async (req, res) => {
    const { eventId, inviteeEmails } = req.body

    if (!eventId || !inviteeEmails || !Array.isArray(inviteeEmails)) {
        return res.status(400).json({ msg: "Missing required fields" })
    }

    try {
        const event = await eventData.findById(eventId)
        if (!event) return res.status(404).json({ msg: "Event not found" })

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })

        const mailOptions = inviteeEmails.map(email => ({
            from: process.env.SMTP_USER,
            to: email,
            subject: `Invitation to: ${event.title}`,
            html: `
                <p>Hello,</p>
                <p>You are invited to the event: <strong>${event.title}</strong>.</p>
                <p>${event.desc}</p>
                <p>Event details:</p>
                <p>Date: ${event.dateTime.start.dateTime}</p>
                <p>Location: ${event.location.address}</p>
                <p>RSVP: <a href="http://localhost:${process.env.PORT}/event/${event._id}/rsvps">RSVP Here</a></p>
            `
        }))

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return res.status(500).json({ msg: "Error sending invitations", error: err.message })
            return res.status(200).json({ msg: "Invitations sent successfully" })
        })

    } catch (err) {
        return res.status(500).json({ msg: "Error sending invitations", error: err.message })
    }
}


export {
    createEventInDatabase,
    getEvent,
    updateRSVP,
    getRSVPs,
    sendInvitations
}

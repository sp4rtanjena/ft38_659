import { eventData } from "../models/eventModel.js"
import { createEvent, getAuthClient } from "../services/calendarService.js"

const createEventInDatabase = async (req, res) => {
    const { title, description, startTime, endTime, timeZone, location, media } = req.body

    if (!title || !startTime || !endTime || !timeZone) {
        return res.status(400).json({ msg: "Missing required fields" })
    }

    try {
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
            location,
            media,
        })

        await newEvent.save()

        const oauth2Client = getAuthClient()
        oauth2Client.setCredentials({ access_token: req.user.accessToken })
        const googleEvent = await createEvent(oauth2Client, {
            title,
            description,
            startTime,
            endTime,
            timeZone
        })

        res.status(200).json({
            msg: "Event created successfully in the database and Google Calendar!",
            event: newEvent,
            googleEvent: googleEvent,
        })
    } catch (err) {
        res.status(500).json({ msg: "Error creating event", error: err.message })
    }
}

export { createEventInDatabase }

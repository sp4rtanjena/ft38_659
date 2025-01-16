import { google } from "googleapis"
import dotenv from "dotenv"

dotenv.config()

const getAuthClient = () => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.REDIRECT_URI
    )
    return oauth2Client
}

const calendar = google.calendar("v3")

const createEvent = async (auth, eventDetails) => {
    const calendarId = "primary"
    try {
        const event = await calendar.events.insert({
            auth,
            calendarId,
            requestBody: {
                summary: eventDetails.title,
                description: eventDetails.description,
                start: {
                    dateTime: eventDetails.startTime,
                    timeZone: eventDetails.timeZone,
                },
                end: {
                    dateTime: eventDetails.endTime,
                    timeZone: eventDetails.timeZone,
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: "popup", minutes: 10080 },
                        { method: "popup", minutes: 1440 },
                    ],
                },
            },
        })
        return event.data
    } catch (err) {
        throw new Error(`Error creating event: ${err.message}`)
    }
}

export { createEvent, getAuthClient }

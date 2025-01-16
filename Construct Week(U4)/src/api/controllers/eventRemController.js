import cron from "node-cron"
import { eventData } from "../../models/eventModel.js"
import { sendReminderEmail } from "../services/sendReminderService.js"
import { userData } from "../../models/userModel.js"

const sendEventReminders = async () => {
    const now = new Date()

    const events = await eventData.find({ reminderSettings: { reminderSent: false } })

    for (let event of events) {
        const eventStartTime = new Date(event.dateTime.start.dateTime)
        let reminderTime

        if (event.reminderSettings.sendReminderBefore === "1 week") {
            reminderTime = new Date(eventStartTime.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else if (event.reminderSettings.sendReminderBefore === "1 day") {
            reminderTime = new Date(eventStartTime.getTime() - 1 * 24 * 60 * 60 * 1000)
        }

        if (now >= reminderTime && now < eventStartTime && !event.reminderSettings.reminderSent) {
            const invitees = await userData.find({ _id: { $in: event.invitees }, "rsvpStatus.status": { $in: ["maybe", "not attending"] } })

            for (let user of invitees) {
                if (user.email) {
                    await sendReminderEmail(user.email, event)
                }
            }

            event.reminderSettings.reminderSent = true
            await event.save()
        }
    }
}

cron.schedule("0 0 * * *", () => {
    console.log("Checking for events to send reminders...")
    sendEventReminders()
})

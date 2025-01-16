import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const sendReminderEmail = async (toEmail, event) => {
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
        subject: `Reminder: RSVP for ${event.title}`,
        html: `
            <p>Hello,</p>
            <p>This is a friendly reminder to RSVP for the event "${event.title}" happening on ${event.dateTime.start.dateTime}.</p>
            <p>${event.desc}</p>
            <p>We would love to know if you can join us. Please confirm your attendance.</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${event.location.lat},${event.location.lng}">Click here to RSVP</a>
            <p>Best regards,</p>
            <p>The Event Team</p>
        `
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log("Reminder email sent successfully")
    } catch (error) {
        console.error("Error sending email:", error)
        throw new Error("Error sending reminder email")
    }
}

export {
    sendReminderEmail
}
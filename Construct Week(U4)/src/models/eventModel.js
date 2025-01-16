import { Schema, model } from "mongoose"
import axios from "axios"
import dotenv from "dotenv"
import { sendInvitationEmail } from "../api/controllers/eventController.js"
import { userData } from "./userModel.js"

dotenv.config()

const locationSchema = new Schema({
    name: { type: String },
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
})

locationSchema.methods.setCoordinates = async function () {
    if (this.address) {
        try {
            const coordinates = await getCoordinates(this.address)
            this.lat = coordinates.lat
            this.lng = coordinates.lng
        } catch (err) {
            console.error("Error setting coordinates:", err)
            throw new Error("Failed to set coordinates for the location.")
        }
    }
}

const getCoordinates = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    try {
        const response = await axios.get(url)
        if (response.data && response.data.length > 0) {
            const location = response.data[0]
            // console.log(location)
            return {
                lat: parseFloat(location.lat),
                lng: parseFloat(location.lon),
            }
        } else {
            throw new Error("No results found for the address.")
        }
    } catch (err) {
        console.error(err)
        throw new Error("Unable to fetch coordinates.")
    }
}

const mediaSchema = new Schema({
    url: { type: String, required: true },
    type: { type: String, required: true },
})

const eventSchema = new Schema({
    title: { type: String, required: true },
    desc: { type: String },
    dateTime: {
        summary: { type: String, required: true },
        start: {
            dateTime: { type: Date, required: true },
            timeZone: { type: String, required: true },
        },
        end: {
            dateTime: { type: Date, required: true },
            timeZone: { type: String, required: true },
        },
    },
    location: locationSchema,
    media: [mediaSchema],
    invitees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    rsvpStatus: [
        {
            user: { type: Schema.Types.ObjectId, ref: "User" },
            status: { type: String, enum: ["attending", "maybe", "not attending"], default: "maybe" },
        },
    ],
    reminderSettings: {
        sendReminderBefore: { type: String, enum: ["1 week", "1 day"], required: true, default: "1 day" },
        reminderSent: { type: Boolean, default: false },
    },
})

eventSchema.pre("save", async function (next) {
    if (!this.isModified("rsvpStatus")) return next()

    try {
        const changedToAttending = this.rsvpStatus.filter(status => status.isModified("status") && status.status === "attending")

        if (changedToAttending.length > 0) {
            for (let status of changedToAttending) {
                const user = await userData.findById(status.user)

                if (user) {
                    await sendInvitationEmail(user.email, this)
                }
            }
        }

        next()
    } catch (err) {
        console.error("Error in pre-save hook:", err)
        next(err)
    }
})

const eventData = model("Event", eventSchema)

export {
    eventData
}

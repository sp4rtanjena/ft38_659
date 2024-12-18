import { Schema, model } from "mongoose"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const locationSchema = new Schema({
    name: { type: String },
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number }
})

locationSchema.methods.setCoordinates = async function () {
    if (this.address) {
        const coordinates = await getCoordinates(this.address)
        this.lat = coordinates.lat
        this.lng = coordinates.lng
    }
}

const getCoordinates = async (address) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`

    try {
        const response = await axios.get(url)
        if (response.data.status === "OK") {
            const location = response.data.results[0].geometry.location
            return {
                lat: location.lat,
                lng: location.lng
            }
        } else throw new Error("Unable to fetch coordinates.")
    } catch (err) {
        console.error(err)
        throw err
    }
}



const dateTimeSchema = new Schema({
    summary: { type: String },
    start: { dateTime: Date, timeZone: String },
    end: { dateTime: Date, timeZone: String },
})

const mediaSchema = new Schema({
    filename: { type: String, required: true },
    path: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }
})

const eventSchema = new Schema({
    title: { type: String, required: true },
    desc: { type: String, default: "" },
    expectedNoGuests: { type: Number },
    location: locationSchema,
    dateTime: dateTimeSchema,
    media: [mediaSchema],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

// Update updated_at everytime the document is modified.
eventSchema.pre("save", async function (next) {
    if (this.isModified("location.address")) await this.location.setCoordinates()
    this.updated_at = Date.now()
    next()
})

const eventData = model("Event", eventSchema)

export {
    eventData
}
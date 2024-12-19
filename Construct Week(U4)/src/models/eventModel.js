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
        // console.log("OSM API Response", response.data)
        if (response.data && response.data.length > 0) {
            const location = response.data[0]
            return {
                lat: parseFloat(location.lat),
                lng: parseFloat(location.lon)
            }
        } else {
            console.error("No results found for the address.", address)
            throw new Error("Unable to fetch coordinates.")
        }
    } catch (err) {
        console.error(err)
        throw err
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
    invitees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    rsvpStatus: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['attending', 'maybe', 'not attending'], default: 'maybe' }
    }]
})

const eventData = model('Event', eventSchema)

export {
    eventData
}
import express from "express"
import { createEventInDatabase, getEvent, getRSVPs, sendInvitations, updateRSVP } from "../controllers/eventController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js"
// import { upload } from "../middlewares/cloudinaryConfig.js"

const eventRouter = express.Router()

// Event Creation API (Authenticated)
eventRouter.post("/create",
    authMiddleware,
    // passport.authenticate("google", { session: true }),
    createEventInDatabase
)


// Fetch Event Details API
eventRouter.get("/:id", getEvent)

// Update RSVP Status API (Authenticated)
eventRouter.post("/rsvp", authMiddleware, updateRSVP)

// Fetch RSVP Status for Event API
eventRouter.get("/:eventId/rsvps", getRSVPs)

// Send Event Invitations API (Authenticated)
eventRouter.post("/send-invitations", authMiddleware, sendInvitations)


export {
    eventRouter
}

import express from "express"
import { createEventInDatabase, deleteEvent, getAllEvents, getEvent, getRSVPs, updateEventInDatabase, updateRSVP } from "../controllers/eventController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import multer from "multer"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const eventRouter = express.Router()

eventRouter.post("/create", authMiddleware, upload.array("media"), createEventInDatabase)
eventRouter.get("/", getAllEvents)
eventRouter.get("/:id", getEvent)
eventRouter.put("/update-event/:id", authMiddleware, upload.array("media"), updateEventInDatabase)
eventRouter.delete("/delete/:id", authMiddleware, deleteEvent)
eventRouter.post("/rsvp", authMiddleware, updateRSVP)
eventRouter.get("/:eventId/rsvps", authMiddleware, getRSVPs)

export {
    eventRouter
}

import express from 'express'
import { createEventInDatabase } from '../controllers/eventController.js'

const eventRouter = express.Router()

// Event Routes
eventRouter.post('/create-event', createEventInDatabase)

export { eventRouter }

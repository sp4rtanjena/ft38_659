import express from "express"
import {
    adminGetAllUsers,
    adminGetUserById,
    adminUpdateUser,
    adminDeleteUser,
    adminGetAllEvents,
    adminGetEventById,
    adminUpdateEvent,
    adminDeleteEvent,
    checkAdmin
} from "../controllers/adminControllers.js"

const adminRouter = express.Router()

// Admin routes
adminRouter.get("/users", checkAdmin, adminGetAllUsers)
adminRouter.get("/users/:userId", checkAdmin, adminGetUserById)
adminRouter.put("/users/:userId", checkAdmin, adminUpdateUser)
adminRouter.delete("/users/:userId", checkAdmin, adminDeleteUser)

adminRouter.get("/events", checkAdmin, adminGetAllEvents)
adminRouter.get("/events/:eventId", checkAdmin, adminGetEventById)
adminRouter.put("/events/:eventId", checkAdmin, adminUpdateEvent)
adminRouter.delete("/events/:eventId", checkAdmin, adminDeleteEvent)

export {
    adminRouter
}

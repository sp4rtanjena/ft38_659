import { Schema, model } from "mongoose"

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    googleId: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

// Update updated_at everytime the document is modified.
userSchema.pre("save", function (next) {
    if (this.isModified()) this.updated_at = Date.now()
    next()
})

const userData = model("User", userSchema)

export {
    userData
}
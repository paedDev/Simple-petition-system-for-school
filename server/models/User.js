// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  idNumber: { type: String, unique: true, required: true },
  role: {
    type: String,
    enum: ["student", "admin"], // Only student and admin roles remain
    default: "student",
  },
});

export default mongoose.model("User", UserSchema);

// models/Petition.js
import mongoose from "mongoose";

const PetitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    subject: { type: String }, // Used for categorizing petitions
    adminComment: { type: String }, // The comment provided by the admin when taking action
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "approved", "denied"],
      default: "open",
    },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notified: { type: Boolean, default: false },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export default mongoose.model("Petition", PetitionSchema);

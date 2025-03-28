const mongoose = require("mongoose");

const PetitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
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
  { timestamps: true }
); // <-- This enables createdAt and updatedAt

module.exports = mongoose.model("Petition", PetitionSchema);

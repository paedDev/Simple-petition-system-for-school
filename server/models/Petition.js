// models/Petition.js
const mongoose = require("mongoose");

const PetitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    subject: { type: String }, // Used for matching teacher expertise (optional)
    teacherReview: { type: String }, // The review provided by the teacher
    prerequisiteComment: { type: String }, // Additional comment by the teacher (e.g., prerequisites issues)
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
  { timestamps: true } // This automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model("Petition", PetitionSchema);

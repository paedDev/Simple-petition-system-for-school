const mongoose = require("mongoose");

const PetitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "closed", "approved", "denied"], // ✅ Add "approved" here
    default: "open",
  },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  notified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Petition", PetitionSchema);

const express = require("express");
const router = express.Router();
const Petition = require("../models/Petition");
const auth = require("../middleware/auth");

// Create a petition (students only)
router.post("/", auth, async (req, res) => {
  if (!req.user || req.user.role !== "student") {
    return res
      .status(403)
      .json({ error: "Only students can create petitions" });
  }

  const { title, description } = req.body;
  const petition = new Petition({
    title,
    description,
    createdBy: req.user.id,
    status: "open",
  });

  try {
    await petition.save();
    res.json(petition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all petitions
router.get("/", auth, async (req, res) => {
  try {
    const petitions = await Petition.find().populate(
      "createdBy",
      "username email"
    );
    res.json(petitions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vote for a petition (students only)
router.post("/:id/vote", auth, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Only students can vote" });
  }
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ error: "Petition not found" });
    }
    // Prevent voting if the petition is closed
    if (petition.status === "closed") {
      return res
        .status(400)
        .json({ error: "This petition is closed. Voting is not allowed." });
    }
    // Stop voting if 40 votes have already been recorded
    if (petition.votes.length >= 40) {
      return res
        .status(400)
        .json({ error: "Vote limit reached. No more votes are allowed." });
    }
    // Check if the student has already voted
    if (petition.votes.includes(req.user.id)) {
      return res.status(400).json({ error: "You already voted" });
    }

    petition.votes.push(req.user.id);

    // Optionally, set the notified flag if exactly 40 votes are reached
    let reached40 = false;
    if (petition.votes.length === 40 && !petition.notified) {
      petition.notified = true;
      reached40 = true;
    }
    await petition.save();
    res.json({
      petition,
      reached40,
      message: reached40
        ? "Vote recorded and petition reached 40 votes!"
        : "Vote recorded!",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update petition (students can edit their own title and description; admins can update status)
// Update petition (students can edit their own title and description; admins can update status)
router.put("/:id", auth, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ error: "Petition not found" });
    }

    if (req.user.role === "student") {
      // Allow student update only if the student is the creator
      if (petition.createdBy.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this petition" });
      }
      const { title, description } = req.body;
      if (title) petition.title = title;
      if (description) petition.description = description;
    } else if (req.user.role === "admin") {
      // Admin can update status (or other allowed fields)
      const { status } = req.body;
      if (status) petition.status = status;
    }

    await petition.save();
    res.json(petition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete petition (admin only)
router.delete("/:id", auth, async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can delete petitions" });
  }
  try {
    const petition = await Petition.findByIdAndDelete(req.params.id);
    if (!petition) {
      return res.status(404).json({ error: "Petition not found" });
    }
    res.json({ message: "Petition deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get voters for a petition
router.get("/:id/voters", auth, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id).populate(
      "votes",
      "username email idNumber"
    );
    if (!petition) {
      return res.status(404).json({ error: "Petition not found" });
    }
    res.json({ voters: petition.votes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

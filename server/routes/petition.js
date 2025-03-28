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
    // Check if the student has already voted
    if (petition.votes.includes(req.user.id)) {
      return res.status(400).json({ error: "You already voted" });
    }
    petition.votes.push(req.user.id);

    let reached40 = false;
    if (petition.votes.length >= 40 && !petition.notified) {
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

// Update petition status (admin only)
router.put("/:id", auth, async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can update petitions" });
  }

  const { status } = req.body;
  try {
    const petition = await Petition.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!petition) {
      return res.status(404).json({ error: "Petition not found" });
    }
    res.json(petition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
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

module.exports = router;

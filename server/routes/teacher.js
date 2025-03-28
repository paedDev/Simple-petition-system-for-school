const express = require("express");
const router = express.Router();
const Petition = require("../models/Petition");
const auth = require("../middleware/auth");

// Teacher Admin Dashboard: get petitions related to a specific subject or criteria
router.get("/dashboard", auth, async (req, res) => {
  if (req.user.role !== "teacherAdmin") {
    return res.status(403).json({ error: "Access denied" });
  }
  try {
    // For example, if a teacher admin has expertise stored in req.user.expertise,
    // you can filter petitions accordingly. Adjust as needed.
    const petitions = await Petition.find().populate(
      "createdBy",
      "username email"
    );
    // Example filter (if petition.subject exists):
    // const filtered = petitions.filter(petition => petition.subject === req.user.expertise);
    res.json(petitions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Student (or general) Signup route with email domain restriction
router.post("/signup", async (req, res) => {
  const { email, username, password, idNumber, role, course } = req.body;

  // Regular expression to match emails ending with @students-uc-bcf.edu.ph
  const emailRegex = /^[\w.-]+@students-uc-bcf\.edu\.ph$/;

  // Check if the provided email matches the allowed domain
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Email must be a valid @students-uc-bcf.edu.ph address" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      idNumber,
      role,
      course,
    });
    await newUser.save();
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

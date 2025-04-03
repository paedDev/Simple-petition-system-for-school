module.exports = mongoose.model("User", UserSchema);

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Student (or general) Signup route
router.post("/signup", async (req, res) => {
  const { email, username, password, idNumber, role, course } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // If role is not provided, the schema defaults to "student"
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      idNumber,
      role, // Accepts only "student" or "admin" now
      course,
    });
    await newUser.save();
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login route (returns token, role, and userId)
router.post("/login", async (req, res) => {
  const { idNumber, password } = req.body; // Use idNumber instead of email
  try {
    const user = await User.findOne({ idNumber }); // Search by idNumber
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, course: user.course },
      "your_jwt_secret",
      { expiresIn: "1d" }
    );
    res.json({ token, role: user.role, userId: user._id, course: user.course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

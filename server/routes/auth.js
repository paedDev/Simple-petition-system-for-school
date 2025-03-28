const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Student (or general) Signup route
router.post("/signup", async (req, res) => {
  const { email, username, password, idNumber, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // If role is not provided, the schema defaults to "student"
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      idNumber,
      role,
    });
    await newUser.save();
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Teacher Signup route (for teachers with role "teacher")
router.post("/teacher/signup", async (req, res) => {
  const { email, username, password, idNumber } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = new User({
      email,
      username,
      password: hashedPassword,
      idNumber,
      role: "teacher",
    });
    await newTeacher.save();
    res.status(201).json({ message: "Teacher account created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Teacher Admin Signup route (for teacher admins with role "teacherAdmin")
router.post("/teacher-admin/signup", async (req, res) => {
  const { email, username, password, idNumber } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      idNumber,
      role: "teacherAdmin",
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "Teacher admin account created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Alternatively, if you want admins to register teacher admins:
router.post("/register-teacher-admin", async (req, res) => {
  const { email, username, password, idNumber } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      idNumber,
      role: "teacherAdmin",
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "Teacher admin account created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating teacher admin account" });
  }
});

// Login route (returns token, role, and userId)
router.post("/login", async (req, res) => {
  console.log("Login request body:", req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for email:", email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "your_jwt_secret",
      { expiresIn: "1d" }
    );
    res.json({ token, role: user.role, userId: user._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

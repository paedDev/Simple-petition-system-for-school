// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const petitionRoutes = require("./routes/petition");

const app = express();
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: ["https://jannoelpaed.vercel.app"], // Allow only your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// MongoDB connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/petitions", petitionRoutes);

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Test endpoint for connection verification
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connection successful" });
});

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import petitionRoutes from "./routes/petition.js";

dotenv.config();

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

// Test endpoint for connection verification
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connection successful" });
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

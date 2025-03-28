const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const petitionRoutes = require("./routes/petition");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.set("strictQuery", false);
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://jannoelpaed17:u2qoEUJlmmApUqYh@cluster0.c1oxvj6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/petitions", petitionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

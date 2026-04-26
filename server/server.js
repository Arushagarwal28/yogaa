require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const mongoose     = require("mongoose");
const errorHandler  = require("./middleware/errorHandler.js");
const authRoutes    = require("./routes/auth.js");
const poseRoutes    = require("./routes/pose.js");
const sessionRoutes = require("./routes/sessions.js");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth",     authRoutes);
app.use("/api/pose",     poseRoutes);
app.use("/api/sessions", sessionRoutes);
app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: new Date() }));
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected");
    app.listen(PORT, () => console.log(`🚀  Server → http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌  MongoDB failed:", err.message);
    process.exit(1);
  });
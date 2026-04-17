const mongoose = require("mongoose");

const FeedbackItemSchema = new mongoose.Schema({
  joint:   { type: String },
  status:  { type: String, enum: ["green", "yellow", "red"] },
  message: { type: String },
  diff:    { type: Number },
}, { _id: false });

const SessionSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  poseName:      { type: String, required: true },
  duration:      { type: Number, required: true },   // seconds
  score:         { type: Number, required: true },    // 0-100
  coins:         { type: Number, default: 0 },
  date:          { type: String, required: true },    // "YYYY-MM-DD"
  angles:        { type: mongoose.Schema.Types.Mixed, default: {} },
  feedback:      { type: [FeedbackItemSchema], default: [] },
  overallStatus: { type: String, enum: ["excellent","good","fair","needs_work"], default: "fair" },
}, { timestamps: true });

SessionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("Session", SessionSchema);
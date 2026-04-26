const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ["user", "shop"], default: "user" },
  coins:    { type: Number, default: 0 },

  // ── Email verification ────────────────────────────────────────────────────
  isVerified: { type: Boolean, default: false },
  // OTP is stored HASHED (bcrypt rounds: 8) — plain OTP is only ever in memory
  // and in the email. Even if the DB leaks, the OTP cannot be reversed.
  otpHash:   { type: String,  default: null },
  otpExpiry: { type: Date,    default: null },

  profile: {
    age:          { type: Number },
    gender:       { type: String },
    heightCm:     { type: Number },
    weightKg:     { type: Number },
    targetWeight: { type: Number },
    goal:         { type: String, default: "Flexibility" },
    level:        { type: String, default: "Beginner" },
  },
}, { timestamps: true });

/* Hash password before save — only when modified */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* Compare plain password */
UserSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

/* Compare plain OTP against stored hash */
UserSchema.methods.matchOtp = function (plain) {
  if (!this.otpHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.otpHash);
};

/* Check OTP is not expired */
UserSchema.methods.isOtpValid = function () {
  return this.otpExpiry && this.otpExpiry > new Date();
};

module.exports = mongoose.model("User", UserSchema);
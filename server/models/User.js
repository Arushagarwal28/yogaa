const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ["user", "shop"], default: "user" },
  coins:    { type: Number, default: 0 },
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

/* Hash password before save */
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/* Compare plain password */
UserSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", UserSchema);
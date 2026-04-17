const jwt  = require("jsonwebtoken");
const User = require("../models/User.js");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeUser = (user) => ({
  id: user._id, name: user.name, email: user.email, role: user.role, coins: user.coins,
});

async function registerUser({ name, email, password, role }) {
  if (await User.findOne({ email }))
    throw Object.assign(new Error("Email already registered"), { status: 409 });
  const user  = await User.create({ name, email, password, role: role || "user" });
  return { token: signToken(user._id), user: safeUser(user) };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  return { token: signToken(user._id), user: safeUser(user) };
}

module.exports = { registerUser, loginUser, safeUser };
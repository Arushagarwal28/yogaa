const jwt        = require("jsonwebtoken");
const bcrypt     = require("bcryptjs");
const otpGenerator = require("otp-generator");
const User       = require("../models/User.js");
const { sendOtpEmail } = require("./emailService.js");

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* Strip sensitive fields before sending user object to client */
const safeUser = (user) => ({
  id:         user._id,
  name:       user.name,
  email:      user.email,
  role:       user.role,
  coins:      user.coins,
  isVerified: user.isVerified,
});

/* ── Generate, hash, and attach a fresh OTP to a user document ──────────── */
async function attachOtp(user) {
  const plain = otpGenerator.generate(6, {
    digits:           true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars:     false,
  });
  user.otpHash   = await bcrypt.hash(plain, 8); // lower rounds — OTP is short-lived
  user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();
  return plain; // only ever held in memory and sent via email
}

/* ── Register ─────────────────────────────────────────────────────────────── */
async function registerUser({ name, email, password, role }) {
  // Check for existing VERIFIED account with this email
  const existing = await User.findOne({ email });
  if (existing && existing.isVerified)
    throw Object.assign(new Error("Email already registered"), { status: 409 });

  // If an unverified account exists (e.g. user never completed OTP),
  // delete it so they can re-register cleanly.
  if (existing && !existing.isVerified) await User.deleteOne({ _id: existing._id });

  // Create user — password hashed by pre-save hook, isVerified defaults to false
  const user  = await User.create({ name, email, password, role: role || "user" });
  const otp   = await attachOtp(user);

  // Send OTP email — if it fails we still tell the user to check their inbox
  // (they can use resend-otp). We don't block registration on email failure.
  try {
    await sendOtpEmail({ to: email, name, otp });
  } catch (emailErr) {
    console.error("[emailService] Failed to send OTP:", emailErr.message);
    // Don't throw — user can request a resend
  }

  // Return the email so the frontend knows who to send to the OTP screen
  return { email, message: "OTP sent — check your inbox" };
}

/* ── Verify OTP ──────────────────────────────────────────────────────────── */
async function verifyOtp({ email, otp }) {
  const user = await User.findOne({ email });
  if (!user)
    throw Object.assign(new Error("No account found for this email"), { status: 404 });
  if (user.isVerified)
    throw Object.assign(new Error("Email already verified"), { status: 400 });
  if (!user.isOtpValid())
    throw Object.assign(new Error("OTP has expired — request a new one"), { status: 400 });
  const match = await user.matchOtp(otp.trim());
  if (!match)
    throw Object.assign(new Error("Incorrect OTP — please try again"), { status: 400 });

  // Mark verified, clear OTP fields
  user.isVerified = true;
  user.otpHash    = undefined;
  user.otpExpiry  = undefined;
  await user.save();

  return { token: signToken(user._id), user: safeUser(user) };
}

/* ── Resend OTP ──────────────────────────────────────────────────────────── */
async function resendOtp({ email }) {
  const user = await User.findOne({ email });
  if (!user)
    throw Object.assign(new Error("No account found for this email"), { status: 404 });
  if (user.isVerified)
    throw Object.assign(new Error("Email already verified"), { status: 400 });

  const otp = await attachOtp(user);
  try {
    await sendOtpEmail({ to: email, name: user.name, otp });
  } catch (emailErr) {
    console.error("[emailService] Failed to resend OTP:", emailErr.message);
    throw Object.assign(new Error("Failed to send email — try again shortly"), { status: 500 });
  }
  return { message: "New OTP sent" };
}

/* ── Login ───────────────────────────────────────────────────────────────── */
async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  if (!user.isVerified)
    throw Object.assign(
      new Error("Email not verified — check your inbox for the OTP"),
      { status: 403, code: "EMAIL_NOT_VERIFIED", email }
    );
  return { token: signToken(user._id), user: safeUser(user) };
}

module.exports = { registerUser, verifyOtp, resendOtp, loginUser, safeUser };
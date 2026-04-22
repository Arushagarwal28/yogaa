const express    = require("express");
const rateLimit  = require("express-rate-limit");
const router     = express.Router();
const controller = require("../controllers/authController.js");
const protect    = require("../middleware/authMiddleware.js");
const validate   = require("../middleware/validate.js");

/* ── Rate limiters ───────────────────────────────────────────────────────────
   Each auth endpoint gets its own targeted limit. ─────────────────────────── */

// 5 registrations per IP per hour — prevents mass fake accounts
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      5,
  message:  { message: "Too many registration attempts — try again in an hour" },
  standardHeaders: true,
  legacyHeaders:   false,
});

// 10 login attempts per IP per 15 min — brute-force protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { message: "Too many login attempts — try again in 15 minutes" },
  standardHeaders: true,
  legacyHeaders:   false,
});

// 5 OTP guesses per IP per 10 min — prevents trying all 999,999 codes
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max:      5,
  message:  { message: "Too many OTP attempts — request a new code" },
  standardHeaders: true,
  legacyHeaders:   false,
});

// 3 resend requests per IP per 10 min — prevents email spam
const resendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max:      3,
  message:  { message: "Too many resend requests — wait a few minutes" },
  standardHeaders: true,
  legacyHeaders:   false,
});

/* ── Routes ─────────────────────────────────────────────────────────────── */
router.post("/register",     registerLimiter, validate("name", "email", "password"), controller.register);
router.post("/verify-email", otpLimiter,                                             controller.verifyEmail);
router.post("/resend-otp",   resendLimiter,                                          controller.resendOtp);
router.post("/login",        loginLimiter,    validate("email", "password"),         controller.login);
router.get("/me",            protect,                                                 controller.getMe);

module.exports = router;
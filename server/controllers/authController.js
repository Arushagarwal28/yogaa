const {
  registerUser, verifyOtp, resendOtp, loginUser, safeUser,
} = require("../services/authService.js");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    // validate middleware already checked presence; do light format checks here
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    const result = await registerUser({ name, email, password, role });
    res.status(201).json(result);
  } catch (err) { next(err); }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "email and otp are required" });
    res.json(await verifyOtp({ email, otp }));
  } catch (err) { next(err); }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });
    res.json(await resendOtp({ email }));
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    res.json(await loginUser({ email, password }));
  } catch (err) { next(err); }
};

exports.getMe = (req, res) => res.json({ user: safeUser(req.user) });
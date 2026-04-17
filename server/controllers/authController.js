const { registerUser, loginUser, safeUser } = require("../services/authService.js");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "name, email and password are required" });
    res.status(201).json(await registerUser({ name, email, password, role }));
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password are required" });
    res.json(await loginUser({ email, password }));
  } catch (err) { next(err); }
};

exports.getMe = (req, res) => res.json({ user: safeUser(req.user) });
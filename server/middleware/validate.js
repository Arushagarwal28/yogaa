module.exports = function validate(...fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => !req.body[f]);
    if (missing.length)
      return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    next();
  };
};
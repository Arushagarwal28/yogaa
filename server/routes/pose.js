const express    = require("express");
const rateLimit  = require("express-rate-limit");
const router     = express.Router();
const controller = require("../controllers/poseController.js");
const protect    = require("../middleware/authMiddleware.js");
const validate   = require("../middleware/validate.js");

// 60 evaluations per user per minute — prevents scoring abuse
const evaluateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      60,
  message:  { message: "Too many evaluation requests — slow down" },
  standardHeaders: true,
  legacyHeaders:   false,
});

router.get("/list",               controller.listPoses);
router.get("/standard/:poseName", controller.getStandard);
router.post("/evaluate", protect, evaluateLimiter, validate("poseName", "angles"), controller.evaluate);

module.exports = router;
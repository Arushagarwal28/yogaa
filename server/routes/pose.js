const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/poseController.js");
const protect    = require("../middleware/authMiddleware.js");
const validate   = require("../middleware/validate.js");

router.get("/list",               controller.listPoses);
router.get("/standard/:poseName", controller.getStandard);

// Validate poseName and angles are present before running the scoring engine.
// Prevents the evaluatePose() call from throwing with a confusing 500 error.
router.post("/evaluate", protect, validate("poseName", "angles"), controller.evaluate);

module.exports = router;
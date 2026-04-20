const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/sessionController.js");
const protect    = require("../middleware/authMiddleware.js");
const validate   = require("../middleware/validate.js");

router.use(protect);

router.get("/",            controller.getSessions);
router.get("/analytics",   controller.getAnalytics);
router.get("/weekly",      controller.getWeekly);

// Save a completed meditation session
// Body: { category: string, duration: number (seconds) }
router.post("/meditation", validate("category", "duration"), controller.saveMeditation);

module.exports = router;
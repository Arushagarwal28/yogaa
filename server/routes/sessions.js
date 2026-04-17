const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/sessionController.js");
const protect    = require("../middleware/authMiddleware.js");

router.use(protect);
router.get("/",          controller.getSessions);
router.get("/analytics", controller.getAnalytics);
router.get("/weekly",    controller.getWeekly);

module.exports = router;
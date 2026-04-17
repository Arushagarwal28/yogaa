const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/poseController.js");
const protect    = require("../middleware/authMiddleware.js");

router.get("/list",               controller.listPoses);
router.get("/standard/:poseName", controller.getStandard);
router.post("/evaluate", protect, controller.evaluate);

module.exports = router;
const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/authController.js");
const protect    = require("../middleware/authMiddleware.js");

router.post("/register", controller.register);
router.post("/login",    controller.login);
router.get("/me",        protect, controller.getMe);

module.exports = router;
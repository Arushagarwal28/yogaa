const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/authController.js");
const protect    = require("../middleware/authMiddleware.js");
const validate   = require("../middleware/validate.js");

// Validate required fields before hitting the controller.
// Returns a clear 400 with the missing field names instead of a DB error.
router.post("/register", validate("name", "email", "password"), controller.register);
router.post("/login",    validate("email", "password"),          controller.login);
router.get("/me",        protect,                                controller.getMe);

module.exports = router;
const express = require("express");

const authController = require("../controllers/auth");
const isAuth = require("../middlewares/is-auth");

const router = express.Router();

// Create User
router.post("/register/", authController.postRegister);

// Login User
router.post("/login/", authController.postLogin);

// Update User (email and name)
router.patch("/update/", isAuth, authController.patchUpdate);

// New User Password
router.put("/password/", isAuth, authController.putPassword);

// Delete User
router.delete("/user/", isAuth, authController.deleteUser);

module.exports = router;

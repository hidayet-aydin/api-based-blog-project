const express = require("express");

const authController = require('../controllers/auth');

const router = express.Router();

// Create User
router.post("/register/", authController.postRegister);

// Login User
router.post("/login/", authController.postLogin);

// Refresh Key
router.patch("/refreshKey/", authController.patchRefreshKey);

// Update User (email and name)
router.patch("/update/", authController.patchUpdate);

// New User Password
router.put("/password/", authController.putPassword);

// Delete User
router.delete("/user/", authController.deleteUser);

module.exports = router;

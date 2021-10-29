const express = require("express");

const authCont = require("../controllers/auth");
const isAuth = require("../middlewares/is-auth");
const isValid = require("../middlewares/is-valid");

const router = express.Router();

// Create User
router.post("/register/", isValid.authRegister, authCont.postRegister);

// Login User
router.post("/login/", isValid.authLogin, authCont.postLogin);

// Update User (email and name)
router.patch("/update/", isAuth, isValid.authUpdate, authCont.patchUpdate);

// New User Password
router.put("/password/", isAuth, isValid.authPassword, authCont.putPassword);

// Delete User
router.delete("/user/", isAuth, authCont.deleteUser);

module.exports = router;

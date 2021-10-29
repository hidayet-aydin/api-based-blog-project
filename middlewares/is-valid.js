const { validationResult, body } = require("express-validator");

const User = require("../models/mongoose/user");

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = new Error(errors.errors[0].msg);
        error.statusCode = 422;
        throw error;
      } else {
        return next();
      }
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    }
  };
};

exports.authRegister = validate([
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Email address already exists!");
        }
      });
    }),
  body("password")
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage("Please enter a valid password (min 5 and max 20 length).")
    .custom((value, { req }) => {
      if (!value.match(/((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i)) {
        return Promise.reject("Password should be alphanumeric.");
      }
      return true;
    }),
  body("name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Username should not be empty.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Please enter a valid username (min 5 and max 50 length)."),
]);

exports.authLogin = validate([
  body("email").isEmail().withMessage("Please enter a valid email."),
  body("password")
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage("Please enter a valid password (min 5 and max 20 length)."),
]);

exports.authUpdate = validate([
  body("newMail")
    .optional()
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Email address already exists!");
        }
      });
    }),
  body("newName")
    .optional()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Username should not be empty.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Please enter a valid username (min 5 and max 50 length)."),
]);

exports.authPassword = validate([
  body("newPassword")
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage("Password must be a minimum of 5 or a maximum of 20 lengths.")
    .custom((value, { req }) => {
      if (!value.match(/((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i)) {
        return Promise.reject("Password should be alphanumeric.");
      }
      return true;
    }),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
]);

exports.blogPost = validate([
  body("title")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Title should not be empty.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Please enter a valid title (min 5 and max 50 length)."),
  body("shortContent")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Short-Content should not be empty.")
    .isLength({ min: 50, max: 300 })
    .withMessage(
      "Please enter a valid Short-Content (min 50 and max 300 length)."
    ),
  body("content")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Content should not be empty.")
    .isLength({ min: 300, max: 1000 })
    .withMessage("Please enter a valid Content (min 200 and max 1000 length)."),
]);

exports.blogPatch = validate([
  body("title")
    .optional()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Title should not be empty.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Please enter a valid title (min 5 and max 50 length)."),
  body("shortContent")
    .optional()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Short-Content should not be empty.")
    .isLength({ min: 50, max: 300 })
    .withMessage(
      "Please enter a valid Short-Content (min 50 and max 300 length)."
    ),
  body("content")
    .optional()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Content should not be empty.")
    .isLength({ min: 300, max: 1000 })
    .withMessage("Please enter a valid Content (min 200 and max 1000 length)."),
]);

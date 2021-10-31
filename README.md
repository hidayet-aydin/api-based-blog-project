# A REST API Based Blog Site Project

This application works as a REST API that Users can manage to list, add, delete, edit their own blogs.

**Development Modules**

```bash
$ npm i --save-dev nodemon nyc supertest mocha chai sinon sinon-chai chai-as-promised rewire
```

**Production Modules**

```bash
$ npm i --save express mongoose bcryptjs jsonwebtoken dotenv express-validator multer aws-s3
```

**Initial Files**

```bash
$ touch .env .gitignore index.js README.md
```

**API Folder Structure**

```bash
$ mkdir server storage
$ mkdir server/routes server/models server/controllers server/utils server/middlewares
```

## 1. MongoDB Create Special User and Collection

```bash
> use nodejs-db
```

```js
db.createUser({
  user: "test-user",
  pwd: "newpassword",
  roles: [{ role: "readWrite", db: "api-based-blog" }],
});
```

For a example, MongoDB connection string below is as follows. And, this connection string should be added to ".env" file.

```
MONGODB_URI='mongodb://test-user:newpassword@localhost:27017/api-based-blog'
```

## 2. Cross-Origin Resource Sharing (CORS) Error handling Adding

```bash
$ touch server/middlewares/cors.js
```

```js
module.exports = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
};
```

## 3. HTTP Logger Middleware (with Morgan)

```bash
$ touch server/middlewares/http-logger.js
```

```js
const morgan = require("morgan");

morgan.token("timer", function (req, res) {
  return new Date().toISOString().replace(/:/g, "");
});

morgan.token("headers", function (req, res) {
  return JSON.stringify(req.headers);
});

const formatGroup = [
  ":timer", //":date[clf]",
  ":method",
  ":status",
  ":url",
  ":response-time(ms)",
  ":headers",
];

if (process.env.MODE === "production") {
  formatGroup.push("HTTP/:http-version", ":remote-addr");
}
const responseFormat = formatGroup.join(" | ");

exports.successHandler = morgan(responseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: console.log },
});

exports.errorHandler = morgan(responseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: console.log },
});
```

## 4. Image Upload Middleware (with Multer)

```
$ touch server/middlewares/image-storage.js
```

```js
const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      (new Date().toISOString() + "-" + file.originalname).replace(/:/g, "")
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
}).single("image");
```

## 5. Authentication Check Middleware (with JSON WEB TOKEN)

```
$ touch server/middlewares/is-auth.js
```

```js
const { verify } = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = verify(token, process.env.JWT_SECRET);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  req.userEmail = decodedToken.email;
  next();
};
```

## 6. About Endpoints

There is two different endpoint groups that are consist of auth and blog. Because Blogs are used by users, user account management must be added. Thanks to authentication, a user only can make adding, modify and deletion process to own posts.

Given below are the contents of the **server/server.js** files.

```js
const express = require("express");

const cors = require("./middlewares/cors");
const { successLogger, errorLogger } = require("./middlewares/http-logger");
const { err404, err500 } = require("./controllers/error");
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");

const service = express();

module.exports = () => {
  service.use(express.json());

  service.use(cors);

  service.use(successLogger, errorLogger);

  service.use("/auth", authRoutes);

  service.use("/blog", blogRoutes);

  service.use(err404, err500);

  return service;
};
```

Given below are the contents of the **server/routes/auth.js** files.

```js
const express = require("express");

const authCont = require("../controllers/auth");
const isAuth = require("../middlewares/is-auth");
const isValid = require("../middlewares/is-valid");
const imageStorage = require("../middlewares/image-storage");

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

// Image Uplod
router.post("/imgUpload/", isAuth, imageStorage, authCont.postUpload);

module.exports = router;
```

Given below are the contents of the **server/routes/blog.js** files.

```js
const express = require("express");

const blogController = require("../controllers/blog");
const isAuth = require("../middlewares/is-auth");
const isValid = require("../middlewares/is-valid");

const router = express.Router();

// Get Recent Blogs
router.get("/recently/", blogController.getRecently);

// Get My Blogs
router.get("/list/", isAuth, blogController.getList);

// Post Blog
router.post("/", isAuth, isValid.blogPost, blogController.postBlog);

// Get Blog
router.get("/:blogId/", blogController.getBlog);

// Edit My Blog
router.patch("/:blogId", isAuth, isValid.blogPatch, blogController.patchBlog);

// Delete Blog
router.delete("/:blogId/", isAuth, blogController.deleteBlog);

module.exports = router;
```

## 7. Adding Endpoint and Internal Server Error Handling

```bash
$ touch server/controllers/error.js
```

```js
exports.err404 = (req, res, next) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
};

exports.err500 = (error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    message: error.message,
    data: error.data,
  });
};
```

## 8. ".env" File

```
PORT=3000
MONGODB_URI='mongodb://test-user:newpassword@localhost:27017/api-based-blog'
JWT_SECRET='JWT_SECRET_KEY'
```

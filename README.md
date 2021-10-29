# A REST API Based Blog Site Project

This application works as a REST API that Users can manage to list, add, delete, edit their own blogs.

**Initial Files**

```bash
$ touch .env .gitignore index.js app.js
```

**Development Modules**

```bash
$ npm i --save-dev nodemon nyc supertest mocha chai sinon sinon-chai chai-as-promised rewire
```

**Production Modules**

```bash
$ npm i --save express mongoose bcryptjs jsonwebtoken dotenv express-validator
```

**API Folder Structure**

```bash
$ mkdir routes models controllers utils middlewares
```

## 1. Cross-Origin Resource Sharing (CORS) Error handling Adding

```bash
touch middlewares/cors.js
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

## 2. MongoDB Create Special User and Collection

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

## 3. Adding Endpoint and Internal Server Error Handling

```bash
$ touch controllers/error.js
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

## 4. About Endpoints

There is two different endpoint groups that are consist of auth and blog. Because Blogs are used by users, user account management must be added. Thanks to authentication, a user only can make adding, modify and deletion process to own posts.

Given below are the contents of the **app.js** files.

```js
const express = require("express");

const cors = require("./middlewares/cors");
const errorControllers = require("./controllers/error");
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");

const app = express();

app.use(express.json());

// Cross-Origin Resource Sharing (CORS) Error handling
app.use(cors);

app.use("/auth", authRoutes);

app.use("/blog", blogRoutes);

app.use(errorControllers.err404, errorControllers.err500);

module.exports = app;
```

Given below are the contents of the **routes/auth.js** files.

```js
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
```

Given below are the contents of the **routes/blog.js** files.

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

## 5. ".env" File

```
PORT=3000
MONGODB_URI='mongodb://test-user:newpassword@localhost:27017/api-based-blog'
JWT_SECRET='JWT_SECRET_KEY'
```

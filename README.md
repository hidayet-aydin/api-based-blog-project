<h1 align="center">A REST API Based Blog</h1>
<p align="center">This application works as a REST API that Users can manage to list, add, delete, edit their own blogs.</p>
<p align="center">
    <a href="https://github.com/hidayet-aydin/api-based-blog-project/blob/main/LICENSE.txt"><img src="https://img.shields.io/github/license/arifszn/article-api"/></a>
</p>
<br/>

![Node.js](https://img.shields.io/badge/node.js-%232c3e50?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/express-%232c3e50?style=for-the-badge&logo=express)
![Nodemon](https://img.shields.io/badge/nodemon-%232c3e50?style=for-the-badge&logo=nodemon)
![Mocha](https://img.shields.io/badge/mocha-%232c3e50?style=for-the-badge&logo=mocha)
![Chai](https://img.shields.io/badge/chai-%232c3e50?style=for-the-badge&logo=chai)
![JS](https://img.shields.io/badge/javascript-%232c3e50?style=for-the-badge&logo=javascript)
![MongoDB](https://img.shields.io/badge/mongodb-%232c3e50?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-%232c3e50?style=for-the-badge&logo=jsonwebtokens)
![GIT](https://img.shields.io/badge/git-%232c3e50?style=for-the-badge&logo=git)

**Development Modules**

```bash
$ npm i --save-dev nodemon nyc supertest mocha chai sinon sinon-chai chai-as-promised rewire
```

**Production Modules**

```bash
$ npm i --save express mongoose bcryptjs jsonwebtoken dotenv express-validator winston morgan multer aws-s3
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

## 2. Logger (with Winston)

```bash
$ touch server/utils/logger.js
```

```js
const { config, createLogger, format, transports } = require("winston");
const { combine, printf, timestamp, prettyPrint } = format;

exports.httpLogger = createLogger({
  level: "info",
  format: combine(
    printf(({ level, message }) => {
      let msg_parts = message.split(" | | ");
      return `{"${level}": {"combined": "${msg_parts[0]}", "headers": ${msg_parts[1]}}},`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "./logs/http.json" }),
  ],
});
```

**Output (./logs/http.json):**

```json
{
  "info": {
    "combined": "2021-11-02T002849.370Z | ::1 | HTTP/1.1 | POST | 201 | /auth/login | 368.041(ms)",
    "headers": {
      "content-type": "application/json",
      "user-agent": "PostmanRuntime/7.28.4",
      "accept": "*/*",
      "postman-token": "6021275c-b747-448d-962a-af17724bdcc3",
      "host": "localhost:3000",
      "accept-encoding": "gzip, deflate, br",
      "connection": "keep-alive",
      "content-length": "59"
    }
  }
}
```

## 3. Cross-Origin Resource Sharing (CORS) Error handling Adding

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

## 4. HTTP Logger Middleware (with Morgan)

```bash
$ touch server/middlewares/http-logger.js
```

```js
const morgan = require("morgan");

morgan.token("timer", function (req, res) {
  return new Date().toISOString();
});

morgan.token("headers", function (req, res) {
  return JSON.stringify(req.headers);
});

const responseFormat = [
  ":timer", //":date[clf]",
  ":remote-addr",
  "HTTP/:http-version",
  ":method",
  ":status",
  ":url",
  ":response-time(ms)",
  "| :headers",
].join(" | ");

exports.successHttp = (logger) =>
  morgan(responseFormat, {
    skip: (req, res) => res.statusCode >= 400,
    stream: { write: (message) => logger.log("info", message) },
  });

exports.errorHttp = (logger) =>
  morgan(responseFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: { write: (message) => logger.log("error", message) },
  });
```

## 5. Image Upload Middleware (with Multer)

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

## 6. Authentication Check Middleware (with JSON WEB TOKEN)

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

## 7. About Endpoints

There is two different endpoint groups that are consist of auth and blog. Because Blogs are used by users, user account management must be added. Thanks to authentication, a user only can make adding, modify and deletion process to own posts.

Given below are the contents of the **server/server.js** files.

```js
const express = require("express");

const cors = require("./middlewares/cors");
const { httpLogger } = require("./utils/logger");
const { successHttp, errorHttp } = require("./middlewares/http-logger");
const { err404, err500 } = require("./controllers/error");
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");

const service = express();

module.exports = () => {
  service.use(express.json());

  service.use(cors);

  service.use(successHttp(httpLogger), errorHttp(httpLogger));

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

## 8. Adding Endpoint and Internal Server Error Handling

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

## 9. ".env" File

```
MODE='development'
PORT=3000
MONGODB_URI='mongodb://test-user:newpassword@localhost:27017/api-based-blog'
JWT_SECRET='somesupersecretsecret'
```

## 10. Test Report

-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |   99.23 |     91.2 |   96.15 |   99.23 |                   
 controllers     |     100 |    89.33 |     100 |     100 |                   
  auth.js        |     100 |     92.1 |     100 |     100 | 38,106-109        
  blog.js        |     100 |    86.48 |     100 |     100 | 82,114,154-160    
 middlewares     |     100 |      100 |     100 |     100 |                   
  is-auth.js     |     100 |      100 |     100 |     100 |                   
  is-valid.js    |     100 |      100 |     100 |     100 |                   
 models/mongoose |   81.81 |      100 |       0 |   81.81 |                   
  blog.js        |   71.42 |      100 |       0 |   71.42 | 17-18             
  user.js        |     100 |      100 |     100 |     100 |                   
-----------------|---------|----------|---------|---------|-------------------

## License

MIT Licensed.

Copyright © Hidayet AYDIN 2021.

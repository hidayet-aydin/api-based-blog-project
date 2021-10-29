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
$ npm i --save express mongoose bcryptjs jsonwebtoken dotenv
```

## API Structure

```bash
$ mkdir routes models controllers utils middlewares
```

### Cross-Origin Resource Sharing (CORS) Error handling Adding

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

### MongoDB Create special user

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

As a result, MongoDB connection string below is as follows. And, this connection string should be added to ".env" file.

```
MONGODB_URI='mongodb://test-user:newpassword@localhost:27017/api-based-blog'
```

### Adding Endpoint and Internal Server Error Handling

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

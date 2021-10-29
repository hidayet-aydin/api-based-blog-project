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
$ mkdir routes models controllers utils
```

## MongoDB Create special user

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

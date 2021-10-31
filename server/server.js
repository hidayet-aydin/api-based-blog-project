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

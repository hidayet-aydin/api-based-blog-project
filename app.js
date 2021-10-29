const express = require("express");

const app = express();

app.use("/", (req, res, next) => {
  res.send("test.");
});

module.exports = app;

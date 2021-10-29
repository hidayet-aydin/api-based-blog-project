const express = require("express");

const authRoutes = require("./routes/auth");

const app = express();

app.use("/auth", authRoutes);

module.exports = app;

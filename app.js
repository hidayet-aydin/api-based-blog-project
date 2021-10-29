const express = require("express");

const cors = require('./middlewares/cors');
const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());

// Cross-Origin Resource Sharing (CORS) Error handling
app.use(cors);

app.use("/auth", authRoutes);

module.exports = app;

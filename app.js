const express = require("express");

const cors = require('./middlewares/cors');
const errorControllers = require('./controllers/error');
const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());

// Cross-Origin Resource Sharing (CORS) Error handling
app.use(cors);

app.use("/auth", authRoutes);

app.use(errorControllers.err404, errorControllers.err500);

module.exports = app;

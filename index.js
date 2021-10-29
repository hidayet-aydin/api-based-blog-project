require("dotenv").config();

const app = require("./app");
const db = require("./utils/mongoose");

db.initDatabase(app);

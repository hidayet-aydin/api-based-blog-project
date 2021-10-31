require("dotenv").config();

const app = require("./server/server");
const db = require("./server/utils/mongoose");

db.initDatabase(app);

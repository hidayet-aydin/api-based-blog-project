require("dotenv").config();

const service = require("./server/server")();
const db = require("./server/utils/mongoose");

db.initDatabase(service);

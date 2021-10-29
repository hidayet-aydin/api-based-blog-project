const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String, index: { unique: true }, require: true },
    name: String,
    password: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

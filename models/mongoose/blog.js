const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, require: true },
    shortContent: { type: String, require: true },
    content: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, require: true },
    shortContent: { type: String, require: true },
    content: { type: String, require: true },
    readed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogSchema.statics.readBlog = async function (blogId) {
  const blog = this.findOne({ _id: blogId }).populate("userId");
  return blog;
};

module.exports = mongoose.model("Blog", blogSchema);

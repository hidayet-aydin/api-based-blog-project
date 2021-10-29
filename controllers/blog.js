exports.getRecently = (req, res, next) => {
  res.status(200).json({ message: "Get Recent Blogs" });
};

exports.getList = (req, res, next) => {
  res.status(200).json({ message: "Get My Blogs" });
};

exports.postBlog = (req, res, next) => {
  res.status(200).json({ message: "Post Blog" });
};

exports.getBlog = (req, res, next) => {
  res.status(200).json({ message: "Get Blog" });
};

exports.patchBlog = (req, res, next) => {
  res.status(200).json({ message: "Edit My Blog" });
};

exports.deleteBlog = (req, res, next) => {
  res.status(200).json({ message: "Delete Blog" });
};

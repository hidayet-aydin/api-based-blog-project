const Blog = require("../models/mongoose/blog");

exports.getRecently = async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate("userId")
      .sort({ updatedAt: -1 })
      .limit(20);
    if (!blogs) {
      const error = new Error("Blogs could not find!");
      error.statusCode = 401;
      throw error;
    }

    const recent_blogs = blogs.map((blog) => {
      return {
        id: blog._id.toString(),
        title: blog.title,
        author: blog.userId.name,
        created: blog.createdAt,
        updated: blog.updatedAt,
      };
    });

    res.status(200).json({ message: "Successful", recent_blogs });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getList = async (req, res, next) => {
  const userId = req.userId;

  try {
    const blogs = await Blog.find({
      userId,
    });
    if (!blogs) {
      const error = new Error("Invalid Authentication!");
      error.statusCode = 401;
      throw error;
    }

    const my_blogs = blogs.map((blog) => {
      return {
        id: blog._id.toString(),
        title: blog.title,
        created: blog.createdAt,
        updated: blog.updatedAt,
      };
    });

    res.status(200).json({ message: "Successful", my_blogs });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postBlog = async (req, res, next) => {
  const userId = req.userId;
  const { title, shortContent, content } = req.body;

  try {
    const newBlog = new Blog({
      userId,
      title,
      shortContent,
      content,
    });
    await newBlog.save();

    res
      .status(201)
      .json({ message: "Blog Posted!", blogId: newBlog._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getBlog = async (req, res, next) => {
  const { blogId } = req.params;

  try {
    const selectedBlog = await Blog.readBlog(blogId);

    if (!selectedBlog) {
      const error = new Error("Blog could not find!");
      error.statusCode = 404;
      throw error;
    }

    if (!selectedBlog.readed) {
      selectedBlog.readed = 1;
    } else {
      selectedBlog.readed = selectedBlog.readed + 1;
    }

    await selectedBlog.save();

    const sendPack = {
      blogId: selectedBlog._id.toString(),
      title: selectedBlog.title,
      shortContent: selectedBlog.shortContent,
      content: selectedBlog.content,
      readed: selectedBlog.readed ? selectedBlog.readed : 0,
      created: selectedBlog.createdAt,
      updated: selectedBlog.updatedAt,
      author: {
        email: selectedBlog.userId.email,
        name: selectedBlog.userId.name,
      },
    };

    res.status(200).json({ message: "Successful", blog: sendPack });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.patchBlog = async (req, res, next) => {
  const { blogId } = req.params;
  const userId = req.userId;
  const { title, shortContent, content } = req.body;

  try {
    if (!title && !shortContent && !content) {
      const error = new Error("There is nothing to change!");
      error.statusCode = 404;
      throw error;
    }

    const selectedBlog = await Blog.findOne({
      _id: blogId,
      userId,
    }).populate("userId");
    if (!selectedBlog) {
      const error = new Error("Blog could not find!");
      error.statusCode = 404;
      throw error;
    }

    if (title) {
      selectedBlog.title = title;
    }
    if (shortContent) {
      selectedBlog.shortContent = shortContent;
    }
    if (content) {
      selectedBlog.content = content;
    }
    await selectedBlog.save();

    res.status(201).json({ message: "Blog Edited!", blogId });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteBlog = async (req, res, next) => {
  const { blogId } = req.params;
  const userId = req.userId;

  try {
    const selectedBlog = await Blog.deleteOne({
      _id: blogId,
      userId,
    });
    if (!selectedBlog) {
      const error = new Error("Invalid Authentication!");
      error.statusCode = 401;
      throw error;
    }

    res.status(200).json({ message: "Blog Deleted!", blogId });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const express = require("express");

const blogController = require("../controllers/blog");
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

// Get Recent Blogs
router.get("/recently/", blogController.getRecently);

// Get My Blogs
router.get("/list/", isAuth, blogController.getList);

// Post Blog
router.post("/", isAuth, blogController.postBlog);

// Get Blog
router.get("/:blogId/", blogController.getBlog);

// Edit My Blog
router.patch("/:blogId", isAuth, blogController.patchBlog);

// Delete Blog
router.delete("/:blogId/", isAuth, blogController.deleteBlog);

module.exports = router;

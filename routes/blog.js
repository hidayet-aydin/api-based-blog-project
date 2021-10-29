const express = require("express");

const blogController = require("../controllers/blog");

const router = express.Router();

// Get Recent Blogs
router.get("/recently/", blogController.getRecently);

// Get My Blogs
router.get("/list/", blogController.getList);

// Post Blog
router.post("/", blogController.postBlog);

// Get Blog
router.get("/:blogId/", blogController.getBlog);

// Edit My Blog
router.patch("/:blogId", blogController.patchBlog);

// Delete Blog
router.delete("/:blogId/", blogController.deleteBlog);

module.exports = router;

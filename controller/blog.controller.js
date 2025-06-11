

const express = require("express")
const Blog = require("../model/blog.model")

const checkAccess = require("../middleware/checkAccess")
const auth = require('../middleware/auth.js')
const roles = require("../constants/roles")
const router = express.Router()


// get all blog.
router.get("/" , async(req , res)=>{
    try {
        const blog = await Blog.find().populate("author" , "username")
        res.status(200).json({message:"Blog fetched successfully!" , Blog:blog})
    } catch (error) {
        res.status(500).json({message:"Error to fetch Blogs!"})
    }
})


// get my own blog

router.get("/myblogs" , auth , checkAccess(roles.author) , async(req , res)=>{
    try {
        const authorId = req.user._id
        const blog = await Blog.find({author:authorId}).populate("author" , "username")
        res.status(200).json({message:"Get mey own blogs!" , Blog:blog} )
    } catch (error) {
        res.status(500).json({message:"Error to fetch my own blogs"})
    }
})
// create blog
// ✅ Blog creation with validation
router.post("/create", auth, checkAccess(roles.author), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required!" });
    }

    const authorId = req.user._id;
    console.log(authorId , title , content)
    const newBlog = new Blog({ title, content, author: authorId });
    const savedBlog = await newBlog.save();
    return res.status(201).json({ message: "Blog posted!", blog: savedBlog });

  } catch (error) {
    return res.status(500).json({ message: "Error posting blog", error: error.message });
  }
});


// update a blog
router.patch("/update/:id", auth, checkAccess(roles.author), async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "No blog found!" });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot update someone else's blog!" });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, req.body, { new: true });

    return res.status(200).json({ message: "Blog updated!", blog: updatedBlog });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ message: "Error updating the blog", error: error.message });
  }
});
router.delete("/delete/:id", auth, checkAccess(roles.author), async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "No blog found!" });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot delete someone else's blog!" });
    }

    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    return res.status(200).json({ message: "Blog deleted!", blog: deletedBlog });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Error deleting the blog", error: error.message });
  }
});

module.exports = router
import asyncHandler from "../../utils/asyncHandler.js";
import blogMoel from "../../models/blogModel.js";
import { deleteFileFromUploads } from "../middleware/multer.js";
import { normalizePath } from "../../utils/normalizePath.js";


export const createBlog = asyncHandler(async (req, res) => {
  const { title, description, recentPosts } = req.body;

  // const images = req.files?.image ? req.files.image.map((file) => file.path) : [];
  const images = req.files?.image
    ? req.files.image.map((file) => normalizePath(file))
    : [];

  const blog = await blogMoel.create({
    title,
    description,
    image: images,
    recentPosts: recentPosts ? JSON.parse(recentPosts) : [],
  });

  res.status(201).json({
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
});




export const updateBlog = asyncHandler(async (req, res) => {
  const { blogId, title, description, recentPosts, recentPostsIndexes, imageIndexes } = req.body;


  if (!blogId) {
    return res.status(400).json({ success: false, message: "blogId is required" });
  }

 
  const blog = await blogMoel.findById(blogId);
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }


  const recentPostsArray = recentPosts ? JSON.parse(recentPosts) : [];
  const recentPostsIndexesArray = recentPostsIndexes ? JSON.parse(recentPostsIndexes) : [];
  const imageIndexesArray = imageIndexes ? JSON.parse(imageIndexes) : [];

 
  blog.title = title ?? blog.title;
  blog.description = description ?? blog.description;

 
  if (recentPostsArray.length > 0) {
    let updatedPosts = [...blog.recentPosts];

    recentPostsIndexesArray.forEach((idx, i) => {
      if (idx >= 0 && idx < updatedPosts.length) {
        updatedPosts[idx] = { title: recentPostsArray[i].title ?? updatedPosts[idx].title };
      } else {
        updatedPosts.push({ title: recentPostsArray[i].title });
      }
    });

    blog.recentPosts = updatedPosts;
  }

  
  if (req.files?.image && req.files.image.length > 0) {
    const newImages = req.files.image.map((file) => normalizePath(file));
    let updatedImages = [...blog.image];

    if (imageIndexesArray.length > 0) {
      for (let i = 0; i < imageIndexesArray.length; i++) {
        const idx = imageIndexesArray[i];

        if (idx >= 0 && idx < updatedImages.length) {
         
          if (updatedImages[idx]) {
            await deleteFileFromUploads(updatedImages[idx]);
          }
          updatedImages[idx] = newImages[i];
        } else {
          updatedImages.push(newImages[i]);
        }
      }
    } else {
    
      updatedImages = [...updatedImages, ...newImages];
    }

    blog.image = updatedImages;
  }

 
  await blog.save();

  res.status(200).json({
    success: true,
    message: "Blog updated successfully",
    data: blog,
  });
});




export const getBlogById = asyncHandler(async (req, res) => {
  const { blogId } = req.query;

  if (!blogId) {
    return res.status(400).json({ success: false, message: "blogId is required" });
  }

  const blog = await blogMoel.findById(blogId);
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }

  res.status(200).json({
    success: true,
    message: "Blog fetched successfully",
    data: blog,
  });
});



export const getBlogByFilter = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const total = await blogMoel.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const blogs = await blogMoel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    message: "Blogs fetched successfully",
    data: blogs,
    pagination: {
      total,
      totalPages,
      currentPage: Number(page),
      limit: Number(limit),
    },
  });
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const { blogId, imageIndexes, recentPostIndexes } = req.query;

  if (!blogId) {
    return res.status(400).json({ success: false, message: "blogId is required" });
  }

  const blog = await blogMoel.findById(blogId);
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }

  const imageIndexesArray = imageIndexes ? JSON.parse(imageIndexes) : [];
  const recentPostIndexesArray = recentPostIndexes ? JSON.parse(recentPostIndexes) : [];

  
  if (imageIndexesArray.length > 0) {
    imageIndexesArray.forEach(async (idx) => {
      if (blog.image[idx]) {
        await deleteFileFromUploads(blog.image[idx]);
        blog.image.splice(idx, 1);
      }
    });
  }

 
  if (recentPostIndexesArray.length > 0) {
    recentPostIndexesArray.forEach((idx) => {
      if (blog.recentPosts[idx]) {
        blog.recentPosts.splice(idx, 1);
      }
    });
  }

 
  if (imageIndexesArray.length === 0 && recentPostIndexesArray.length === 0) {
    if (blog.image && blog.image.length > 0) {
      for (let img of blog.image) {
        await deleteFileFromUploads(img);
      }
    }
    await blog.deleteOne();
    return res.status(200).json({ success: true, message: "Blog deleted successfully" });
  }

  await blog.save();

  res.status(200).json({
    success: true,
    message: "Selected items deleted successfully",
    data: blog,
  });
});

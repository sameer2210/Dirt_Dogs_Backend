import express from "express";
import { upload } from "../middleware/multer.js";
import { createBlog, deleteBlog, getBlogById, getBlogByFilter, updateBlog } from "../controllers/blogController.js";

const router = express.Router();

router.post(
  "/admin/createBlog",
  upload.fields([{ name: "image" }]),
  createBlog
);


router.put(
  "/admin/updateBlog",
  upload.fields([{ name: "image" }]),
  updateBlog
);


router.delete("/admin/deleteBlog", deleteBlog);


router.get("/admin/getBlogById", getBlogById);
router.get("/users/getBlogById", getBlogById);



router.get("/admin/getBlogByFilter", getBlogByFilter);
router.get("/users/getBlogByFilter", getBlogByFilter);



export default router;

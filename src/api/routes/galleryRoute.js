import express from "express";
import { upload } from "../middleware/multer.js";
import { createGallery, deleteGallery, getGalleryByFilter, getGalleryById, updateGallery } from "../controllers/galleryController.js";

const router = express.Router();


// Admin Routes
router.post("/admin/createGallery", upload.fields([{ name: "mainImages" }, { name: "subImages" }]), createGallery);
router.put("/admin/updateGallery", upload.fields([{ name: "mainImages" }, { name: "subImages" }]),updateGallery);
router.get("/admin/getGalleryById",getGalleryById);
router.delete("/admin/deleteGallery",deleteGallery);
router.get("/admin/getGalleryByFilter", getGalleryByFilter);

// User Routes
router.get("/users/getGalleryById", getGalleryById);
router.get("/users/getGalleryByFilter", getGalleryByFilter);

export default router;
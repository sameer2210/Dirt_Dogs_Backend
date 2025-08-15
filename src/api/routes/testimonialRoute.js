import express from "express";
import { createTestimonial, deleteTestimonial, getTestimonialByFilter, getTestimonialById, updateTestimonial } from "../controllers/testimonialController.js";

const router = express.Router();


// Admin routes
router.post("/admin/createTestimonial", createTestimonial);
router.put("/admin/updateTestimonial", updateTestimonial);

router.get("/admin/getTestimonialById", getTestimonialById);
router.delete("/admin/deleteTestimonial", deleteTestimonial);
router.get("/admin/getTestimonialByFilter", getTestimonialByFilter);


// For user
router.get("/users/getTestimonialByFilter",getTestimonialByFilter);
router.get("/users/getTestimonialById", getTestimonialById);


export default router;
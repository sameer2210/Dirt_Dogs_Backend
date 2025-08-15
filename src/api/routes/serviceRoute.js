import express from "express";
import { upload } from "../middleware/multer.js";
import { createService, deleteService, getServiceByFilter, getServiceById, updateService } from "../controllers/serviceController.js";

const router = express.Router();


// Admin routes
router.post("/admin/createService", upload.fields([{ name: "image" }]),createService);
router.put("/admin/updateService", upload.fields([{ name: "image" }]), updateService);
router.get("/admin/getServiceById", getServiceById);
router.delete("/admin/deleteService", deleteService);
router.get("/admin/getServiceByFilter", getServiceByFilter);

// User routes
router.get("/users/getServiceByFilter", getServiceByFilter);
router.get("/users/getServiceById", getServiceById);

export default router;
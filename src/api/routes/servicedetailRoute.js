import express from "express";
import { upload } from "../middleware/multer.js";
import { createServiceDetail, deleteServiceDetail, getServiceDetailByFilter, getServiceDetailById, updateServiceDetail } from "../controllers/servicedetailController.js";

const router = express.Router();

// Admin routes
router.post(
  "/admin/createServiceDetail",
  upload.fields([{ name: "banners" }, { name: "image" }, { name: "video" }]),
  createServiceDetail
);
router.put(
  "/admin/updateServiceDetail",
  upload.fields([{ name: "banners" }, { name: "image" }, { name: "video" }]),
  updateServiceDetail
);
router.get("/admin/getServiceDetailById", getServiceDetailById);
router.delete("/admin/deleteServiceDetail", deleteServiceDetail);
router.get("/admin/getServiceDetailByFilter", getServiceDetailByFilter);

// User routes
router.get("/users/getServiceDetailByFilter", getServiceDetailByFilter);
router.get("/users/getServiceDetailById", getServiceDetailById);

export default router;
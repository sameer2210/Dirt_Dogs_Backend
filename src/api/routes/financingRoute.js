import express from "express";
import { upload } from "../middleware/multer.js";
import { createFinancing, deleteFinancing, getFinancingByFilter, getFinancingById, updateFinancing } from "../controllers/financingController.js";

const router = express.Router();


router.post("/admin/createFinancing", upload.single("icon"), createFinancing);
router.put("/admin/updateFinancing", upload.single("icon"),updateFinancing);
router.get("/admin/getFinancingById", getFinancingById);
router.get("/admin/getFinancingByFilter", getFinancingByFilter);
router.delete("/admin/deleteFinancing",deleteFinancing);


router.get("/users/getFinancingByFilter", getFinancingByFilter);
router.get("/users/getFinancingById", getFinancingById);

export default router;
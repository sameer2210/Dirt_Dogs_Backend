import express from "express";
import { createGivingBack, deleteGivingBack, getGivingBackByFilter, getGivingBackById, updateGivingBack } from "../controllers/givingController.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();



router.post("/admin/createGivingBack", upload.fields([{ name: "mainImages" }, { name: "subImages" }]), createGivingBack);
router.put("/admin/updateGivingBack", upload.fields([{ name: "mainImages" }, { name: "subImages" }]), updateGivingBack);
router.get("/admin/getGivingBackById", getGivingBackById);
router.delete("/admin/deleteGivingBack", deleteGivingBack);
router.get("/admin/getGivingBackByFilter", getGivingBackByFilter);


router.get("/users/getGivingBackById", getGivingBackById);
router.get("/users/getGivingBackByFilter", getGivingBackByFilter);

export default router;
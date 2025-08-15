import express from "express";
import { getCompany, updateCompany } from "../controllers/companyController.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

// for User
router.get("/user/getCompany",getCompany);

// for Admin
router.get("/admin/getCompany",getCompany);
router.put("/admin/updateCompany",upload.fields([{name:"footerIcon"}]),updateCompany);

export default router;
import express from "express";
import { upload } from "../middleware/multer.js";
import { deleteAbout, getAbout, getAboutById, updateAbout } from "../controllers/aboutController.js";

const router = express.Router();


router.get("/admin/getAbout",getAbout);

router.get("/users/getAbout",getAbout);

router.put(
  "/admin/updateAbout",
  upload.fields([{ name: "loyaldogsImage"},{ name: "ownerImage"}]),
  updateAbout
);

router.get("/users/getAboutById",getAboutById);
router.get("/admin/getAboutById",getAboutById);


router.delete("/admin/deleteAbout",deleteAbout);




export default router;

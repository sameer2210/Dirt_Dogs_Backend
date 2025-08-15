import express from "express";
import { upload } from "../middleware/multer.js";
import { getHomePage, updateHomePage } from "../controllers/homeController.js";

const router = express.Router();

router.get("/admin/getHomePage",getHomePage);
router.get("/users/getHomePage", getHomePage);

router.put(
  "/admin/updateHomePage",
  upload.fields([
    { name: "topImage" },
    { name: "homeIcon" },
  ]),
  updateHomePage
);



export default router;
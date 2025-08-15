import multer from "multer";
import path from "path";
import fs from "fs";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/jpg",
  "video/mp4",
  "video/mkv",
  "video/webm",
  "video/avi",
];

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname}`),
  }),
  fileFilter: (req, file, cb) => {
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only images or video is allowed"), false);
  },
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});


// export const deleteFileFromUploads = (filePath) => {
//   if (!filePath) return;

//   try {
    
//     const fileName = path.basename(filePath);
//     const fullPath = path.join("uploads", fileName);

//     if (fs.existsSync(fullPath)) {
//       fs.unlinkSync(fullPath);
//       console.log(`File deleted successfully: ${fullPath}`);
//     } else {
//       console.log(`File not found: ${fullPath}`);
//     }
//   } catch (error) {
//     console.error(`Error deleting file: ${error.message}`);
//   }
// };
export const deleteFileFromUploads = (filePath) => {
  if (!filePath) return;

  try {
   
    const normalizedPath = filePath.replace(/\\/g, "/");

   
    const fileName = path.basename(normalizedPath);

    
    const fullPath = path.join(process.cwd(), "uploads", fileName);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`File deleted successfully: ${fullPath}`);
    } else {
      console.log(`File not found: ${fullPath}`);
    }
  } catch (error) {
    console.error(`Error deleting file: ${error.message}`);
  }
};


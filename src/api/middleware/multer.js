import crypto from 'crypto';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import s3 from '../../config/s3.js';
import { deleteFromS3 } from '../../utils/s3Upload.js';

const AWS_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'dirt-dogs-bucket';

const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'video/mp4',
  'video/mkv',
  'video/webm',
  'video/avi',
];

// Configure multer for S3
export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
      });
    },
    key: (req, file, cb) => {
      // Generate unique key with timestamp and random string
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const fileExtension = path.extname(file.originalname);
      const fileName = `uploads/${timestamp}-${randomString}${fileExtension}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only images or video is allowed'), false);
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

/**
 * Delete file from S3
 * Now using S3 URL instead of local file path
 * @param {string} fileUrl - S3 URL or S3 key
 */
export const deleteFileFromUploads = async fileUrl => {
  if (!fileUrl) return;

  try {
    await deleteFromS3(fileUrl);
  } catch (error) {
    console.error(`Error deleting file from S3: ${error.message}`);
  }
};

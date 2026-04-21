# S3 Integration - Developer Guide

## Overview

This guide explains how the new S3 integration works for developers who need to work with uploads/downloads.

## Core Concepts

### 1. File Upload Flow

```javascript
// In a controller:
export const createService = asyncHandler(async (req, res) => {
  // req.files.image is populated by multer-s3
  const images = req.files?.image || [];

  // Each file object now has .location (S3 URL) instead of .path (local path)
  const imagePaths = images.map(file => {
    return file.location; // e.g., "https://bucket.s3.amazonaws.com/uploads/123-abc.jpg"
  });

  // Save S3 URLs to database
  const service = await Service.create({
    title: req.body.title,
    images: imagePaths,
  });

  res.json({ success: true, data: service });
});
```

### 2. File Deletion Flow

```javascript
import { deleteFileFromUploads } from '../middleware/multer.js';

// In a controller:
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.body.serviceId);

  // deleteFileFromUploads is now ASYNC - must use await
  for (const imageUrl of service.images) {
    await deleteFileFromUploads(imageUrl);
  }

  await Service.deleteOne();
  res.json({ success: true });
});
```

### 3. Updated Helper - normalizePath

```javascript
import { normalizePath } from '../../utils/normalizePath.js';

// Before (disk storage):
// Returns: "uploads/123-file.jpg"

// After (S3):
// Returns: "https://bucket.s3.amazonaws.com/uploads/123-file.jpg"

// Usage - same in both cases:
const imagePath = normalizePath(req.files.image[0]);
```

## S3 Utilities

### Upload to S3

```javascript
import { uploadToS3 } from '../../utils/s3Upload.js';

// Rarely needed - multer-s3 handles automatic uploads
// Use this only for custom upload scenarios
const url = await uploadToS3(fileBuffer, fileName, mimeType);
```

### Delete from S3

```javascript
import { deleteFromS3 } from '../../utils/s3Upload.js';

// Also rarely needed - use deleteFileFromUploads instead
await deleteFromS3(s3Url);
```

### Get File from S3

```javascript
import { getFromS3 } from '../../utils/s3Upload.js';

// For downloading files
const fileBuffer = await getFromS3('uploads/123-file.jpg');
```

### List Files in S3

```javascript
import { listS3Files } from '../../utils/s3Upload.js';

// Get all files in uploads folder
const files = await listS3Files();
```

## Frontend Integration

### Displaying Images

```javascript
// In React components:
import { getImageUrl } from '@/utils/getImageUrl';

export function ServiceCard({ service }) {
  return <img src={getImageUrl(service.image[0])} alt="Service" />;
}
```

The `getImageUrl` function automatically:

- Detects S3 URLs and returns them as-is
- Handles backward compatibility with local uploads
- Falls back to placeholder for missing images

## Environment Configuration

### Backend (.env)

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=my-bucket-name
```

### Frontend (.env if needed)

```env
VITE_API_URL=http://localhost:3000
```

## Common Patterns

### Pattern 1: Simple Upload

```javascript
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.files?.image) {
    return res.status(400).json({ success: false, message: 'No image' });
  }

  const imageUrl = normalizePath(req.files.image[0]);

  const data = await Model.create({
    image: imageUrl,
  });

  res.json({ success: true, data });
});
```

### Pattern 2: Update with Image Replacement

```javascript
export const updateImage = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const data = await Model.findById(id);

  if (req.files?.image) {
    // Delete old image from S3
    if (data.image) {
      await deleteFileFromUploads(data.image);
    }

    // Upload new image to S3
    data.image = normalizePath(req.files.image[0]);
  }

  await data.save();
  res.json({ success: true, data });
});
```

### Pattern 3: Multiple Files

```javascript
export const uploadMultipleImages = asyncHandler(async (req, res) => {
  const images = req.files?.images || [];

  // Convert all uploaded files to S3 URLs
  const imageUrls = images.map(file => file.location);

  const data = await Model.create({
    images: imageUrls,
  });

  res.json({ success: true, data });
});
```

### Pattern 4: Selective Deletion

```javascript
export const deleteSelectedImages = asyncHandler(async (req, res) => {
  const { id, imageIndexes } = req.body;
  const data = await Model.findById(id);

  // Delete selected images from S3
  const indexes = JSON.parse(imageIndexes);
  for (const idx of indexes) {
    await deleteFileFromUploads(data.images[idx]);
  }

  // Remove from array
  data.images = data.images.filter((_, i) => !indexes.includes(i));

  await data.save();
  res.json({ success: true, data });
});
```

## Multer Configuration

### Current Setup

```javascript
// src/api/middleware/multer.js
export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_S3_BUCKET_NAME,
    acl: 'public-read',
    key: (req, file, cb) => {
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
      : cb(new Error('Only images or video allowed'), false);
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});
```

### Usage in Routes

```javascript
// src/api/routes/serviceRoute.js
import { upload } from '../middleware/multer.js';
import { createService } from '../controllers/serviceController.js';

router.post(
  '/create-service',
  upload.array('image', 10), // Accept up to 10 files
  createService
);
```

### File Object Structure

**Before (Disk Storage):**

```javascript
req.files.image[0] = {
  fieldname: 'image',
  originalname: 'photo.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  path: 'uploads/1234567890-photo.jpg',
  size: 45678,
};
```

**After (S3 Storage):**

```javascript
req.files.image[0] = {
  fieldname: 'image',
  originalname: 'photo.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  location: 'https://bucket.s3.amazonaws.com/uploads/1234567890-abc123.jpg',
  bucket: 'bucket',
  key: 'uploads/1234567890-abc123.jpg',
  size: 45678,
  etag: '"abc123def456"',
};
```

**Key Difference:** Use `file.location` instead of `file.path`

## Error Handling

### Common Errors

**1. No S3 Connection**

```
Error: S3 connection failed: Missing credentials
```

Solution: Check `.env` has `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

**2. Upload Fails**

```
Error: Access Denied
```

Solution: Check IAM user has `AmazonS3FullAccess` policy

**3. File Not Found on Delete**

```
Error: The specified key does not exist
```

Solution: URL format may be wrong - ensure it's the full S3 URL

**4. File Too Large**

```
Error: Request entity too large
```

Solution: File exceeds 50MB limit - reduce file size

## Testing

### Test S3 Upload

```bash
curl -X POST http://localhost:3000/api/create-service \
  -F "title=Test" \
  -F "description=Test" \
  -F "image=@test.jpg"
```

### Check Connection

The server automatically tests S3 connection on startup. Check logs for:

```
✅ S3 connection successful
```

### Manual S3 Test

```javascript
// In src/config/s3.js
import { testS3Connection } from './config/s3.js';
await testS3Connection();
```

## Performance Considerations

1. **Parallel Uploads**: S3 handles this automatically
2. **Large Files**: Consider multipart upload for files > 100MB
3. **Caching**: Frontend caches images via browser cache
4. **CDN**: Add CloudFront for global distribution
5. **Cleanup**: Old files can be auto-deleted via S3 lifecycle policies

## Migration Notes

### From Local to S3

If you need to migrate existing local files:

```bash
# 1. List all files
aws s3 ls s3://your-bucket/uploads/

# 2. Upload local files
aws s3 sync ./uploads s3://your-bucket/uploads/

# 3. Update database URLs
db.services.updateMany(
  { image: { $regex: "^uploads/" } },
  [{ $set: { image: { $concat: ["https://bucket.s3.amazonaws.com/", "$image"] } } }]
)
```

## References

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Multer-S3 GitHub](https://github.com/badrap/multer-s3)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
- [Express.js File Upload](https://expressjs.com/en/resources/middleware/multer.html)

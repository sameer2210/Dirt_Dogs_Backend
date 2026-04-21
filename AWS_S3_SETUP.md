# AWS S3 Integration - Complete Setup Guide

## Overview

This project has been fully integrated with AWS S3 for file storage. All image and video uploads are now stored on AWS S3 instead of the local filesystem.

## Architecture Flow

### Upload Flow

```
Frontend (Upload)
    ↓
Backend API (POST with multipart/form-data)
    ↓
Multer-S3 Middleware (validates & uploads to S3)
    ↓
AWS S3 (stores file, returns public URL)
    ↓
Backend Controller (saves S3 URL to MongoDB)
    ↓
Frontend (receives S3 URL, displays via getImageUrl utility)
```

### Delete Flow

```
Frontend (Delete request)
    ↓
Backend API (DELETE with file URL)
    ↓
deleteFileFromUploads function (S3 helper)
    ↓
AWS S3 (deletes object)
    ↓
MongoDB (record updated/deleted)
    ↓
Frontend (refreshes data)
```

## Setup Instructions

### 1. AWS S3 Bucket Setup

#### Create an S3 Bucket:

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. **Bucket name**: `dirt-dogs-bucket` (or your preferred name - must be globally unique)
4. **Region**: Select your closest region (e.g., `us-east-1`)
5. **Block Public Access settings**:
   - Uncheck "Block all public access" (needed for public image serving)
6. Click "Create bucket"

#### Configure Bucket Policy:

1. Go to your bucket → **Permissions** tab
2. Click **Bucket policy**
3. Paste this policy (replace `dirt-dogs-bucket` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dirt-dogs-bucket/*"
    }
  ]
}
```

4. Click **Save**

#### Enable CORS (if needed for direct browser uploads):

1. Go to **CORS** section in Permissions
2. Add:

```xml
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 2. Create IAM User with S3 Access

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. **User name**: `dirt-dogs-backend`
4. Click **Next**
5. On permissions, choose **Attach policies directly**
6. Search for and select: `AmazonS3FullAccess`
7. Click **Create user**

#### Generate Access Keys:

1. Click on the new user
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Choose **Application running outside AWS**
5. Click **Next** and then **Create access key**
6. **Save the Access Key ID and Secret Access Key** (you'll need these)

### 3. Backend Configuration

#### Update `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_from_iam_user
AWS_SECRET_ACCESS_KEY=your_secret_key_from_iam_user
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=dirt-dogs-bucket
```

#### Install Dependencies (Already Done):

```bash
cd Backend
npm install aws-sdk multer-s3
```

### 4. Key Files Modified/Created

#### New Files:

- `Backend/src/config/s3.js` - S3 client initialization
- `Backend/src/utils/s3Upload.js` - S3 operations (upload, delete, get)

#### Modified Files:

- `Backend/src/api/middleware/multer.js` - Now uses multer-s3
- `Backend/src/app.js` - Removed local uploads serving, added S3 test
- `Backend/src/utils/normalizePath.js` - Updated to handle S3 URLs
- `Backend/.env` - Added AWS credentials
- `Frontend/src/utils/getImageUrl.js` - Already handles S3 URLs (no changes needed)

## File Structure

### Backend Upload Handling:

```javascript
// Controllers receive S3 URLs instead of local paths
// Example: req.files.image[0].location → "https://dirt-dogs-bucket.s3.amazonaws.com/uploads/1234567890-abc123.jpg"

// Delete handling - now async
await deleteFileFromUploads(s3Url);
```

### Frontend Usage:

```javascript
import { getImageUrl } from '@/utils/getImageUrl';

// Works with S3 URLs automatically
<img src={getImageUrl(product.image)} />;
```

## Environment Variables

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=           # IAM user access key
AWS_SECRET_ACCESS_KEY=       # IAM user secret key
AWS_REGION=us-east-1         # AWS region
AWS_S3_BUCKET_NAME=          # S3 bucket name
```

## API Endpoints - No Changes

All existing API endpoints work the same way. The difference is:

- **Before**: Files stored locally in `/uploads` folder
- **Now**: Files stored on AWS S3, URLs stored in MongoDB

### Example Flow:

```bash
# Upload (POST)
POST /api/create-service
Body: {
  title: "Service Name",
  description: "Description"
}
Files: image (multipart)

Response: {
  success: true,
  data: {
    _id: "...",
    image: ["https://dirt-dogs-bucket.s3.amazonaws.com/uploads/1234-abc.jpg"]
  }
}

# Delete
DELETE /api/delete-service?serviceId=123&imageIndexes=[0]

# Update
PUT /api/update-service
```

## Troubleshooting

### S3 Connection Failed

1. Check AWS credentials in `.env`
2. Verify bucket name is correct
3. Check IAM user has `AmazonS3FullAccess` policy
4. Check bucket region matches `AWS_REGION` in `.env`

### Upload Fails

1. Check bucket policy allows public reads
2. Verify CORS settings if doing browser uploads
3. Check file size doesn't exceed 50MB limit
4. Check file type is in allowed list (images/videos)

### Images Not Displaying

1. Check S3 URLs are being saved to MongoDB
2. Verify bucket policy is correct (public read)
3. Check URL format: `https://bucket-name.s3.amazonaws.com/uploads/...`
4. Test URL directly in browser

### Deletion Fails

1. Ensure URL/key format matches S3 object key
2. Check IAM user has delete permissions
3. Verify bucket still exists

## Cost Considerations

**Free Tier (First 12 months):**

- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests
- Data transfer in is free
- 100 GB data transfer out per month

**Estimated Monthly Cost:**

- Storage: $0.023 per GB
- Requests: Minimal for small projects
- Data transfer: $0.09 per GB

## Security Best Practices

1. **Use IAM Roles** (not root credentials)
2. **Restrict Bucket Policy** to only needed operations
3. **Enable Versioning** for disaster recovery
4. **Use HTTPS** for all connections
5. **Rotate Access Keys** regularly
6. **Monitor Usage** via CloudWatch
7. **Use CloudFront** for CDN caching (optional)

## Migration from Local Uploads

If you have existing files in `/uploads`:

1. Upload them to S3 manually or via AWS CLI
2. Update MongoDB documents with new S3 URLs
3. Clean up local `/uploads` folder

## Next Steps

1. Update `.env` with your AWS credentials
2. Test upload functionality
3. Monitor CloudWatch for any errors
4. Set up CloudFront for faster delivery (optional)
5. Configure auto-scaling policies (optional)

## Support Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
- [Multer-S3 Documentation](https://github.com/badrap/multer-s3)
- [AWS S3 Pricing](https://aws.amazon.com/s3/pricing/)

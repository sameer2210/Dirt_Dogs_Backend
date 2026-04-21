# S3 Integration - Quick Start Checklist

## ✅ Completed Backend Setup

- [x] Installed AWS SDK and multer-s3
- [x] Created S3 configuration file (`src/config/s3.js`)
- [x] Created S3 utilities (`src/utils/s3Upload.js`)
- [x] Updated multer middleware for S3 uploads
- [x] Updated app.js to test S3 connection
- [x] Updated normalizePath utility to handle S3 URLs
- [x] Added AWS environment variables template to .env

## 🔧 To Complete - Action Items

### Step 1: AWS Account Setup (5-10 minutes)

- [ ] Create AWS account if not already done
- [ ] Create S3 bucket following `AWS_S3_SETUP.md`
- [ ] Configure bucket policy for public read access
- [ ] Create IAM user with S3 access
- [ ] Generate and save Access Key and Secret Key

### Step 2: Configure Backend (2 minutes)

- [ ] Update `.env` with your AWS credentials:
  ```
  AWS_ACCESS_KEY_ID=your_key_here
  AWS_SECRET_ACCESS_KEY=your_secret_here
  AWS_REGION=us-east-1
  AWS_S3_BUCKET_NAME=your_bucket_name
  ```

### Step 3: Update Frontend (if needed)

- [ ] Frontend already supports S3 URLs (no changes needed)
- [ ] If using custom image serving, update endpoints

### Step 4: Test the Integration

- [ ] Start backend: `npm start`
- [ ] Check console for "✅ S3 connection successful"
- [ ] Upload an image via admin panel
- [ ] Verify image appears with S3 URL
- [ ] Verify image displays correctly on page

### Step 5: Test Delete Function

- [ ] Delete an image from admin
- [ ] Verify it's removed from S3 and database

## 📊 What Changed

### Backend

| File                           | Change                                       |
| ------------------------------ | -------------------------------------------- |
| `src/api/middleware/multer.js` | Now uses multer-s3, S3 delete function       |
| `src/app.js`                   | Removed local uploads serving, added S3 test |
| `src/config/s3.js`             | NEW - S3 client config                       |
| `src/utils/s3Upload.js`        | NEW - S3 operations                          |
| `src/utils/normalizePath.js`   | Updated to handle S3 URLs                    |
| `.env`                         | Added AWS credentials                        |

### Frontend

| File                       | Change                                 |
| -------------------------- | -------------------------------------- |
| `src/utils/getImageUrl.js` | Updated comments (already supports S3) |

## 🔄 File Upload Flow (Now)

```
1. User uploads file via form
   ↓
2. Multer-S3 intercepts multipart data
   ↓
3. File uploaded directly to AWS S3
   ↓
4. S3 returns public URL (e.g., https://bucket.s3.amazonaws.com/uploads/...)
   ↓
5. Controller receives S3 URL in req.files[x].location
   ↓
6. S3 URL saved to MongoDB
   ↓
7. Frontend fetches data, displays image via getImageUrl() utility
```

## 🧹 Cleanup

You can now safely:

- [ ] Delete the `/uploads` folder (or keep for backup)
- [ ] Remove local file serving from server.js (already done)
- [ ] Update any CI/CD pipelines that reference local uploads

## 🐛 Debugging

If uploads fail:

1. Check `.env` has all AWS credentials
2. Run: `curl -X POST http://localhost:3000/api/test-s3` (if implemented)
3. Check browser console for network errors
4. Check server logs for S3 errors
5. Verify bucket policy allows public read

## 📝 Environment Template

Copy this to your `.env`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=dirt-dogs-bucket
```

## 🚀 Performance Tips

1. Consider using CloudFront CDN for faster delivery
2. Set appropriate cache headers in S3
3. Compress images before upload
4. Use S3 lifecycle policies for old file cleanup
5. Monitor usage in CloudWatch

## ✨ Features Available

✅ Upload images and videos to S3
✅ Automatic S3 connection test on server start
✅ Delete images from S3 when record is deleted
✅ Public URL generation for display
✅ Support for multiple file types
✅ 50MB file size limit
✅ Automatic file naming with timestamps

## 📚 More Info

See `AWS_S3_SETUP.md` for:

- Detailed setup instructions
- AWS Console walkthrough
- Bucket policy configuration
- CORS setup
- Troubleshooting guide
- Cost considerations
- Security best practices

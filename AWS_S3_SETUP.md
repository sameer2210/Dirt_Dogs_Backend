# AWS S3 Setup (Verified for This Project)

Last verified: April 27, 2026

## What Is Running Now

This backend uploads files directly to S3 using `multer-s3`, stores S3 URLs in MongoDB, and deletes old S3 objects when records are updated/deleted.

Current S3 files in code:

- `src/config/s3.js`
- `src/api/middleware/multer.js`
- `src/utils/s3Upload.js`
- `src/utils/normalizePath.js`

## Required Environment Variables

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

## Dependencies (Current)

```bash
cd Backend
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage multer multer-s3
```

## AWS Console Setup

1. Create an S3 bucket in your target region.
2. Use bucket name in `AWS_S3_BUCKET_NAME`.
3. If you want public URL rendering from frontend, allow public object read.
4. Create IAM user/access key for app usage (do not use root credentials).

## IAM Permissions Needed

Minimum for upload/delete/list object operations:

- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`
- `s3:ListBucket`

Because startup test currently uses `ListBucketsCommand`, this is also needed:

- `s3:ListAllMyBuckets`

## Runtime Flow

### Upload

1. Request hits route with `upload.single(...)` or `upload.fields(...)`.
2. `multer-s3` validates type/size and uploads to `uploads/<timestamp>-<random>.<ext>`.
3. Controller receives `file.location` (full S3 URL).
4. URL is saved to MongoDB.

### Delete/Replace

1. Controller calls `await deleteFileFromUploads(urlOrKey)`.
2. `deleteFromS3()` extracts key from full URL when needed.
3. `DeleteObjectCommand` removes object from S3.
4. DB document is updated/deleted.

## Important Project Fix Applied

A real backend syntax error was fixed:

- Error: `SyntaxError: Unexpected reserved word`
- Root cause: `await` was used inside non-async `forEach` callbacks.
- Fixed files:
  - `src/api/controllers/serviceController.js`
  - `src/api/controllers/servicedetailController.js`
- Fix pattern: replaced `forEach` with async-safe `for...of` loop.

## Validation Commands

```bash
cd Backend
node --check src/api/controllers/serviceController.js
node --check src/api/controllers/servicedetailController.js
npm start
```

Expected startup log when credentials/policy are valid:

`S3 connection successful`

## Troubleshooting

### `S3 connection failed`

- Check all AWS env vars.
- Check bucket region matches `AWS_REGION`.
- Confirm IAM key is active.
- Confirm IAM policy includes `s3:ListAllMyBuckets` (required by current startup test).

### Upload fails

- Allowed MIME types are image/jpeg, image/png, image/jpg, video/mp4, video/mkv, video/webm, video/avi.
- Max file size is 50MB.
- Check bucket and key permissions.

### File URL saved but image/video not visible

- Confirm object is publicly readable (or switch app to signed/private flow).
- Confirm stored URL points to correct bucket and key.

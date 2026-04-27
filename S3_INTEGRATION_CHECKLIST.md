# S3 Integration Checklist (Current Project)

Last verified: April 27, 2026

## 1. Backend Code Status

- [x] `src/config/s3.js` exists and initializes `S3Client`
- [x] `src/api/middleware/multer.js` uses `multer-s3`
- [x] `src/utils/s3Upload.js` supports upload/delete/get/list
- [x] `src/utils/normalizePath.js` supports S3 URL path normalization
- [x] Startup S3 test is called from `src/app.js`

## 2. Fixed Error Status

- [x] Fixed `SyntaxError: Unexpected reserved word`
- [x] Replaced invalid `await` in `forEach` with async-safe loops
- [x] Fixed files:
  - `src/api/controllers/serviceController.js`
  - `src/api/controllers/servicedetailController.js`

## 3. AWS Account/IAM/Bucket

- [ ] Bucket created in target region
- [ ] `.env` has correct `AWS_S3_BUCKET_NAME`
- [ ] IAM key is active
- [ ] IAM policy allows:
  - `s3:PutObject`
  - `s3:GetObject`
  - `s3:DeleteObject`
  - `s3:ListBucket`
  - `s3:ListAllMyBuckets` (required by current startup test)
- [ ] Public-read strategy confirmed for media URLs (or private strategy intentionally implemented)

## 4. Environment Variables

- [ ] `AWS_ACCESS_KEY_ID` set
- [ ] `AWS_SECRET_ACCESS_KEY` set
- [ ] `AWS_REGION` set
- [ ] `AWS_S3_BUCKET_NAME` set

## 5. Runtime Verification

- [ ] Run:
  - `node --check src/api/controllers/serviceController.js`
  - `node --check src/api/controllers/servicedetailController.js`
  - `npm start`
- [ ] Confirm log: `S3 connection successful`
- [ ] Upload from admin route succeeds
- [ ] DB saves S3 URL (`https://...amazonaws.com/uploads/...`)
- [ ] Delete/replace action removes old S3 object

## 6. Current Upload/Delete Flow

- [x] Client sends multipart form-data
- [x] Route middleware `upload.single/fields` handles upload
- [x] `multer-s3` stores object in `uploads/` key prefix
- [x] Controller stores `file.location` URL in DB
- [x] On update/delete, controller calls `deleteFileFromUploads`
- [x] Helper extracts key from URL and deletes from S3

## 7. Route Reality Check

- [x] Service upload route: `POST /api/admin/createService`
- [x] Service update route: `PUT /api/admin/updateService`
- [x] Service detail upload route: `POST /api/admin/createServiceDetail`
- [x] Service detail update route: `PUT /api/admin/updateServiceDetail`
- [x] Home update upload route: `PUT /api/admin/updateHomePage`
- [x] Admin profile upload route: `PUT /api/admin/updateAdminProfile`
- [x] No `/api/test-s3` route currently exists

## 8. Optional Cleanup

- [ ] Keep/remove local `Backend/uploads` based on migration plan
- [ ] Remove old local-upload assumptions from legacy docs/comments
- [ ] Add CloudFront and lifecycle rules if needed

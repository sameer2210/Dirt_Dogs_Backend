# S3 Integration Developer Guide

Last verified: April 27, 2026

## Current Backend Design

- Upload middleware: `src/api/middleware/multer.js`
- S3 client/test: `src/config/s3.js`
- S3 helpers: `src/utils/s3Upload.js`
- Path compatibility helper: `src/utils/normalizePath.js`

Uploads are handled by `multer-s3`, not local disk storage.

## File Object in Controllers

When file arrives from `multer-s3`, use:

- `file.location` (full S3 URL, preferred)
- `file.key` (S3 key)

Compatibility fallback still exists in several controllers:

```js
const value = file.location || file.path;
```

## Safe Upload Pattern

```js
const images = req.files?.image ? req.files.image.map(file => normalizePath(file)) : [];
```

`normalizePath()` returns:

- S3 URL when `file.location` exists
- normalized local path when `file.path` exists

## Safe Delete Pattern

Always await deletes:

```js
await deleteFileFromUploads(existingUrlOrKey);
```

For arrays, use async-safe loop:

```js
for (const [i, idx] of indexes.entries()) {
  if (updatedImages[idx]) {
    await deleteFileFromUploads(updatedImages[idx]);
  }
  updatedImages[idx] = newImages[i];
}
```

Do not use `await` inside `forEach`.

## Important Fix Applied

This was fixed in code:

- Error: `SyntaxError: Unexpected reserved word`
- Cause: `await` inside non-async `forEach`.
- Fixed in:
  - `src/api/controllers/serviceController.js`
  - `src/api/controllers/servicedetailController.js`

## Routes Using S3 Uploads

- `POST /api/admin/createService` (`image`)
- `PUT /api/admin/updateService` (`image`)
- `POST /api/admin/createServiceDetail` (`banners`, `image`, `video`)
- `PUT /api/admin/updateServiceDetail` (`banners`, `image`, `video`)
- `PUT /api/admin/updateHomePage` (`topImage`, `homeIcon`)
- `PUT /api/admin/updateAdminProfile` (`image`)
- Other admin routes also use `upload.fields(...)` similarly.

Note: there is no `/api/test-s3` endpoint in current codebase.

## S3 Startup Check

`src/app.js` calls `testS3Connection()` on startup.

Current test uses `ListBucketsCommand`, so IAM needs:

- `s3:ListAllMyBuckets`

## Validation Checklist for Developers

```bash
cd Backend
node --check src/api/controllers/serviceController.js
node --check src/api/controllers/servicedetailController.js
npm start
```

Expected log:

`S3 connection successful`

## Common Errors

### `SyntaxError: Unexpected reserved word`

- Check for `await` inside `forEach`.
- Replace with `for...of` or `for` loops.

### `S3 connection failed`

- Check `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`.
- Verify IAM permissions include `s3:ListAllMyBuckets` for current startup check.

### Upload rejected

- Check MIME type against allow-list in `multer.js`.
- Check 50MB upload limit.

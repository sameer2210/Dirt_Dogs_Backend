/**
 * Normalize file path or S3 URL
 * Works with both multer-s3 (returns location) and disk storage (returns path)
 * @param {Object} file - The file object from multer
 * @returns {string} - Normalized path or S3 URL
 */
export const normalizePath = file => {
  if (!file) return null;

  // For multer-s3: file.location contains the S3 URL
  if (file.location) {
    return file.location;
  }

  // For disk storage: file.path contains the local path
  if (file.path) {
    return file.path.replace(/\\/g, '/');
  }

  return null;
};

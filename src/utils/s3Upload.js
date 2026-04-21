import crypto from 'crypto';
import path from 'path';
import s3 from '../config/s3.js';
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const AWS_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'dirt-dogs-bucket';

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file content as buffer
 * @param {string} fileName - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - S3 file URL
 */
export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  try {
    // Generate unique key for S3
    const fileExtension = path.extname(fileName);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const key = `uploads/${timestamp}-${randomString}${fileExtension}`;

    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read', // Make file publicly readable
    };

    const upload = new Upload({
      client: s3,
      params: params
    });
    const result = await upload.done();
    console.log(`✅ File uploaded to S3: ${result.Location}`);

    return result.Location; // Full S3 URL
  } catch (error) {
    console.error('❌ Error uploading to S3:', error.message);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
};

/**
 * Delete a file from S3
 * @param {string} fileUrl - Full S3 URL or just the key
 * @returns {Promise<void>}
 */
export const deleteFromS3 = async fileUrl => {
  try {
    if (!fileUrl) return;

    // Extract key from URL if it's a full URL
    let key = fileUrl;
    if (fileUrl.includes('amazonaws.com')) {
      // Extract key from URL like: https://bucket.s3.amazonaws.com/uploads/123-abc.jpg
      key = fileUrl.split('.com/').pop();
    }

    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(params));
    console.log(`✅ File deleted from S3: ${key}`);
  } catch (error) {
    console.error('❌ Error deleting from S3:', error.message);
    // Don't throw error on delete, just log it
  }
};

/**
 * Get a file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<Buffer>}
 */
export const getFromS3 = async key => {
  try {
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    };

    const data = await s3.send(new GetObjectCommand(params));
    return data.Body;
  } catch (error) {
    console.error('❌ Error getting file from S3:', error.message);
    throw new Error(`Failed to get file from S3: ${error.message}`);
  }
};

/**
 * List all files in S3 bucket
 * @returns {Promise<Array>}
 */
export const listS3Files = async () => {
  try {
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Prefix: 'uploads/',
    };

    const data = await s3.send(new ListObjectsV2Command(params));
    return data.Contents || [];
  } catch (error) {
    console.error('❌ Error listing S3 files:', error.message);
    throw error;
  }
};

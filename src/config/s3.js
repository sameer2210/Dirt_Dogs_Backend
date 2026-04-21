import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config(); // Ensure dotenv is safely loaded

const s3Config = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION || 'us-east-1',
};

// Initialize S3
const s3 = new S3Client(s3Config);

// Test connection
export const testS3Connection = async () => {
  try {
    await s3.send(new ListBucketsCommand({}));
    console.log('S3 connection successful');
    return true;
  } catch (error) {
    console.error('S3 connection failed:', error.message);
    return false;
  }
};

export default s3;

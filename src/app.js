import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { errorMiddleware } from './api/middleware/errorMiddleware.js';
import { testS3Connection } from './config/s3.js';
dotenv.config();

// import route

import { fileURLToPath } from 'url';
import aboutRoute from '../src/api/routes/aboutRoute.js';
import adminRoute from '../src/api/routes/adminRoute.js';
import blogRoute from '../src/api/routes/blogRoute.js';
import companyRoute from '../src/api/routes/companyRoute.js';
import financingRoute from '../src/api/routes/financingRoute.js';
import galleryRoute from '../src/api/routes/galleryRoute.js';
import givingRoute from '../src/api/routes/givingRoute.js';
import homeRoute from '../src/api/routes/homeRoute.js';
import quotesRoute from '../src/api/routes/quotesRoute.js';
import serviceRoute from '../src/api/routes/serviceRoute.js';
import servicedetailRoute from '../src/api/routes/servicedetailRoute.js';
import testimonialRoute from '../src/api/routes/testimonialRoute.js';

const app = express();

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

app.use(errorMiddleware);
app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Test S3 connection on startup
testS3Connection().catch(err => console.error('S3 connection error:', err));

// Note: Local uploads folder is no longer served since we're using S3
// Files are now uploaded to and served from AWS S3

// route

app.use('/api', adminRoute);
app.use('/api', homeRoute);
app.use('/api', aboutRoute);
app.use('/api', serviceRoute);
app.use('/api', blogRoute);
app.use('/api', servicedetailRoute);
app.use('/api', testimonialRoute);
app.use('/api', quotesRoute);
app.use('/api', galleryRoute);
app.use('/api', givingRoute);
app.use('/api', financingRoute);
app.use('/api', companyRoute);

export default app;

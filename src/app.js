import dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { errorMiddleware } from "./api/middleware/errorMiddleware.js";
import path from "path"




// import route

import homeRoute from "../src/api/routes/homeRoute.js";
import companyRoute from "../src/api/routes/companyRoute.js";
import aboutRoute from "../src/api/routes/aboutRoute.js";
import givingRoute from "../src/api/routes/givingRoute.js";
import serviceRoute from "../src/api/routes/serviceRoute.js";
import servicedetailRoute from "../src/api/routes/servicedetailRoute.js";
import quotesRoute from "../src/api/routes/quotesRoute.js";
import blogRoute from "../src/api/routes/blogRoute.js";
import testimonialRoute from "../src/api/routes/testimonialRoute.js";
import financingRoute from "../src/api/routes/financingRoute.js";
import galleryRoute from "../src/api/routes/galleryRoute.js";
import adminRoute from "../src/api/routes/adminRoute.js";
import { fileURLToPath } from "url";


const app = express();




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan("tiny"));

app.use(errorMiddleware);
app.use(cors({
  origin: "http://localhost:5173",  
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true    
}));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));



// route

app.use("/api",adminRoute);
app.use("/api",homeRoute);
app.use("/api",aboutRoute);
app.use("/api",serviceRoute);
app.use("/api",blogRoute);
app.use("/api",servicedetailRoute);
app.use("/api",testimonialRoute);
app.use("/api",quotesRoute);
app.use("/api",galleryRoute);
app.use("/api",givingRoute);
app.use("/api",financingRoute);
app.use("/api",companyRoute);


export default app;
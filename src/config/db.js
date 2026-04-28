import  mongoose from "mongoose";
import { createDefaultHome } from "../models/homeModel.js";
import { createDefaultAbout } from "../models/aboutModel.js";
import { createDefaultAdmin } from "../models/adminModel.js";
import { createDefaultCompany } from "../models/companyModel.js";

const databaseConnection = async()=>{

    const DB_URL = process.env.DB_URL;

   await mongoose.connect(DB_URL)
   .then(async()=>{
  
    console.log("Database Connected")

    await createDefaultAdmin();
    await createDefaultHome();
    await createDefaultAbout();
    await createDefaultCompany();
    
})
.catch((error)=>console.log(error.message));

};

export default databaseConnection;

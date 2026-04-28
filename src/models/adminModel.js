import mongoose from "mongoose";
import { hashValue } from "../utils/hashValue.js";

const adminSchema = new mongoose.Schema({

    name:{
        type:String,
        trim:true
    },

    email:{
        type:String,
        trim:true
    },

    password:{
        type:String,
        trime:true
    },
    image:{
      type:String,
    },

    userType:{
     type: String,
      enum: ["Admin","SubAdmin"],
      default: "Admin",
      trim: true,
    }
},{timestamps:true});

const Admin = mongoose.model("Admin",adminSchema);

export default Admin;



const createDefaultAdmin = async () => {
  const password = process.env.ADMIN_PASSWORD;
  const defaultAdminEmail = (process.env.ADMIN_EMAIL || "sameerkhan27560@gmail.com").toLowerCase().trim();

  if (!password) {
    console.warn("ADMIN_PASSWORD is missing; skipping default admin creation.");
    return;
  }

  // Idempotent check: if any admin exists with configured default email, don't create again
  const existingAdmin = await Admin.findOne({
    email: defaultAdminEmail,
    userType: "Admin",
  });

  if (!existingAdmin) {
    const hashedPassword = await hashValue(password);

    await Admin.create({
      name: "Dirtydog",
      email: defaultAdminEmail,
      password: hashedPassword,
      userType: "Admin",
    });

    console.log("Default admin created successfully");
  } else {
    console.log("Default admin already exists");
  }
};

export {createDefaultAdmin};

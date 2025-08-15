import adminModel from "../../models/adminModel.js"
import  jwt from "jsonwebtoken";
import { compareValue } from "../../utils/hashValue.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const adminLogin = asyncHandler(async(req,res)=>{

     const {email,password} = req.body;

   const adminUser = await adminModel.findOne({email,userType:"Admin"});

  const isMatchPassword = await compareValue(password,adminUser.password);

    if(!isMatchPassword){
    return res.status(401).json({
      success:false,message:"Wrong Password"
    })
  }

  const token = jwt.sign({id: adminUser._id,userType:adminUser.userType},process.env.JWT_SECRET_KEY,{expiresIn:"16d"})

   adminUser._doc.token = token;

   res.status(200).json({success:true,message:"Admin Login successfully",data:adminUser})
})


export const updateAdminProfile = asyncHandler(async(req,res)=>{

    const { name,  password,adminId } = req.body;
    const image = req.file?.path || null;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    const admin = await adminModel.findOne({ _id:adminId, userType: "Admin" });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (name) admin.name = name;
    if (password) admin.password = await hashValue(password);
    if (image) admin.image = image;

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      data: admin,
    });
})

export const getAdmin = asyncHandler(async(req,res)=>{

     const admin = await adminModel.find();
     if(!admin){
        return res.status(404).json({success:false,message:"admin not found"})
     }

    res.status(200).json({success:true,message:"Admin fetched successfully",data:admin})
})
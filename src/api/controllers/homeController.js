import Blog from "../../models/blogModel.js";
import homeModel from "../../models/homeModel.js";
import Quote from "../../models/quotesModel.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { deleteFileFromUploads } from "../middleware/multer.js";
import galleryModel from "../../models/galleryModel.js";
import serviceModel from "../../models/serviceModel.js";
import givinModel from "../../models/serviceModel.js";
import testimonialModel from "../../models/testimonialModel.js";


export const getHomePage = asyncHandler(async (req, res) => {
 
  const home = await homeModel.findOne();

  if (!home) {
    return res.status(404).json({
      success: false,
      message: "Home Data not found",
    });
  }

  const blogs = await Blog.find().sort({ createdAt: -1 });
  const quotes = await Quote.find().sort({ createdAt: -1 });
  const service = await serviceModel.find().sort({ createdAt: -1 });
  const gallery = await galleryModel.find().sort({ createdAt: -1 });
  const giving = await givinModel.find().sort({ createdAt: -1 });
  const testimonial = await testimonialModel.find().sort({ createdAt: -1 });


  home._doc.serviceModel=service;
  home._doc.galleryModel=gallery;
  home._doc.givinModel=giving
  home._doc.Quote=quotes

  home._doc.testimonial=testimonial;
  home._doc.Blog=blogs;


  res.status(200).json({
    success: true,
    message: "Home data fetched successfully",
    data: home,
  });
});



export const updateHomePage = asyncHandler(async (req, res) => {
  const {
    homeId,
    heading,
    phoneNumber,
    email,
    homeDescription,
    commitment,
    topImageIndexes,
  } = req.body;


  if (!homeId) {
    return res.status(400).json({
      success: false,
      message: "homeId is required",
    });
  }

 
  const home = await homeModel.findById(homeId);
  if (!home) {
    return res.status(404).json({
      success: false,
      message: "Home not found",
    });
  }

 
  const topImageIndexesArray = topImageIndexes
    ? JSON.parse(topImageIndexes)
    : [];


  home.heading = heading ?? home.heading;
  home.phoneNumber = phoneNumber ?? home.phoneNumber;
  home.email = email ?? home.email;
  home.homeDescription = homeDescription ?? home.homeDescription;
  home.commitment = commitment ? JSON.parse(commitment) : home.commitment;

  
  if (req.files?.topImage && req.files.topImage.length > 0) {
    const newImages = req.files.topImage.map((file) => file.path);
    let updatedImages = [...home.topImage];

    if (topImageIndexesArray.length > 0) {
     
      for (let i = 0; i < topImageIndexesArray.length; i++) {
        const idx = topImageIndexesArray[i];

        if (idx >= 0 && idx < updatedImages.length) {
       
          if (updatedImages[idx]) {
            await deleteFileFromUploads(updatedImages[idx]);
          }
          updatedImages[idx] = newImages[i];
        } else {
    
          updatedImages.push(newImages[i]);
        }
      }
    } else {

      updatedImages = [...updatedImages, ...newImages];
    }

    home.topImage = updatedImages;
  }

  
  if (req.files?.homeIcon && req.files.homeIcon.length > 0) {
    if (home.homeIcon) {
      await deleteFileFromUploads(home.homeIcon);
    }
    home.homeIcon = req.files.homeIcon[0].path;
  }

  await home.save();

  res.status(200).json({
    success: true,
    message: "Home page updated successfully",
    data: home,
  });
});

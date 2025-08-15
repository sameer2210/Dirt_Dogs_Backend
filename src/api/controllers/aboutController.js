import asyncHandler from "../../utils/asyncHandler.js";
import aboutModel from "../../models/aboutModel.js";
import { deleteFileFromUploads } from "../middleware/multer.js";
import { normalizePath } from "../../utils/normalizePath.js";



export const getAbout = asyncHandler(async (req, res) => {
   
    
  const about = await aboutModel.findOne();
  if (!about) {
    return res.status(404).json({
      success: false,
      message: "About content not found",
    });
  }
  
  res.status(200).json({
    success: true,
    message: "About content retrieved successfully",
    data: about,
  });
});

export const updateAbout = asyncHandler(async (req, res) => {
  const {
    aboutId,
    companyHistory,
    commitmentToQuality,
    ownerInfo,
    serviceAreas,
    customerTestimonials,
    testimonialIndexes,
    loyaldogsIndexes,
  } = req.body;

  if (!aboutId) {
    return res.status(400).json({
      success: false,
      message: "aboutId is required",
    });
  }

  const about = await aboutModel.findById(aboutId);
  if (!about) {
    return res.status(404).json({
      success: false,
      message: "About data not found",
    });
  }


  const safeJSONParse = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

 
  about.companyHistory = companyHistory ? safeJSONParse(companyHistory) : about.companyHistory;
  about.commitmentToQuality = commitmentToQuality ? safeJSONParse(commitmentToQuality) : about.commitmentToQuality;
  about.serviceAreas = serviceAreas ? safeJSONParse(serviceAreas) : about.serviceAreas;

 
  let parsedOwnerInfo = ownerInfo ? safeJSONParse(ownerInfo) : about.ownerInfo;

  if (req.files?.ownerImage && req.files.ownerImage.length > 0) {
    const newOwnerImagePath = normalizePath(req.files.ownerImage[0]);

   
    if (about.ownerInfo?.image) {
      await deleteFileFromUploads(about.ownerInfo.image);
    }

    parsedOwnerInfo.image = newOwnerImagePath; 
  }

  about.ownerInfo = parsedOwnerInfo;

 
  const testimonialIndexesArray = testimonialIndexes ? safeJSONParse(testimonialIndexes) : [];

  if (customerTestimonials) {
    const newTestimonials = safeJSONParse(customerTestimonials);
    let updatedTestimonials = [...about.customerTestimonials];

    if (testimonialIndexesArray.length > 0) {
      for (let i = 0; i < testimonialIndexesArray.length; i++) {
        const idx = testimonialIndexesArray[i];
        if (idx >= 0 && idx < updatedTestimonials.length) {
          updatedTestimonials[idx] = newTestimonials[i];
        } else {
          updatedTestimonials.push(newTestimonials[i]);
        }
      }
    } else {
      updatedTestimonials = newTestimonials;
    }

    about.customerTestimonials = updatedTestimonials;
  }

  
  const loyaldogsIndexesArray = loyaldogsIndexes ? safeJSONParse(loyaldogsIndexes) : [];

  if (req.files?.loyaldogsImage && req.files.loyaldogsImage.length > 0) {
    const newImages = req.files.loyaldogsImage.map((file) => normalizePath(file));
    let updatedImages = [...about.loyaldogsImage];

    if (loyaldogsIndexesArray.length > 0) {
      for (let i = 0; i < loyaldogsIndexesArray.length; i++) {
        const idx = loyaldogsIndexesArray[i];
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

    about.loyaldogsImage = updatedImages;
  }

  await about.save();

  res.status(200).json({
    success: true,
    message: "About page updated successfully",
    data: about,
  });
});


export const getAboutById = asyncHandler(async(req,res)=>{

    const { aboutId } = req.query;
    
    if (!aboutId) {
        return res.status(400).json({
        success: false,
        message: "About ID is required",
        });
    }
    
    const about = await aboutModel.findById(aboutId);
    if (!about) {
        return res.status(404).json({
        success: false,
        message: "About content not found",
        });
    }
    
    res.status(200).json({
        success: true,
        message: "About content retrieved successfully",
        data: about,
    });
});




export const deleteAbout = asyncHandler(async (req, res) => {
  const { aboutId, testimonialIndexes, loyaldogsImageIndexes, serviceAreaIndexes } = req.body;

  if (!aboutId) {
    return res.status(400).json({
      success: false,
      message: "aboutId is required",
    });
  }


  const about = await aboutModel.findById(aboutId);
  if (!about) {
    return res.status(404).json({
      success: false,
      message: "About not found",
    });
  }

  if (!testimonialIndexes && !loyaldogsImageIndexes && !serviceAreaIndexes) {
  
    if (about.loyaldogsImage && about.loyaldogsImage.length > 0) {
      for (const img of about.loyaldogsImage) {
        await deleteFileFromUploads(img);
      }
    }

    await about.deleteOne();

    return res.status(200).json({
      success: true,
      message: "About deleted successfully",
    });
  }

  
  const deleteByIndexes = (arr, indexes) => {
    const sortedIndexes = indexes.sort((a, b) => b - a);
    sortedIndexes.forEach((idx) => {
      if (arr[idx]) arr.splice(idx, 1);
    });
  };

  
  const testimonialIdxArr = testimonialIndexes ? JSON.parse(testimonialIndexes) : [];
  const loyaldogsIdxArr = loyaldogsImageIndexes ? JSON.parse(loyaldogsImageIndexes) : [];
  const serviceAreaIdxArr = serviceAreaIndexes ? JSON.parse(serviceAreaIndexes) : [];

 
  if (testimonialIdxArr.length > 0) {
    deleteByIndexes(about.customerTestimonials, testimonialIdxArr);
  }

  if (loyaldogsIdxArr.length > 0) {
    loyaldogsIdxArr.forEach(async (idx) => {
      if (about.loyaldogsImage[idx]) {
        await deleteFileFromUploads(about.loyaldogsImage[idx]);
      }
    });
    deleteByIndexes(about.loyaldogsImage, loyaldogsIdxArr);
  }


  if (serviceAreaIdxArr.length > 0) {
    deleteByIndexes(about.serviceAreas, serviceAreaIdxArr);
  }


  await about.save();

  res.status(200).json({
    success: true,
    message: "Selected fields deleted successfully",
    data: about,
  });
});

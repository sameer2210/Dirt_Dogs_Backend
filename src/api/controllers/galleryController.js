import asyncHandler from "../../utils/asyncHandler.js";
import galleryModel from "../../models/galleryModel.js";
import { deleteFileFromUploads } from "../middleware/multer.js";
import { normalizePath } from "../../utils/normalizePath.js";


// export const createGallery = asyncHandler(async (req, res) => {
//   const { title, description, galleryType } = req.body;

//   if (!galleryType) {
//     return res.status(400).json({ success: false, message: "galleryType is required" });
//   }

//   const mainImages = req.files?.mainImages || [];
//   const subImages = req.files?.subImages || [];

//   const images = mainImages.map((main, index) => ({
//     mainImages: main.path,
//     subImages: subImages.filter(img => img.fieldname === `subImages-${index}`).map(img => img.path)
//   }));

//   const gallery = await Gallery.create({
//     title,
//     description,
//     galleryType,
//     images,
//   });

//   res.status(201).json({
//     success: true,
//     message: "Gallery created successfully",
//     data: gallery,
//   });
// });


export const createGallery = asyncHandler(async (req, res) => {
  const { title, description, galleryType } = req.body;

  if (!galleryType) {
    return res.status(400).json({ success: false, message: "galleryType is required" });
  }

  const mainImages = req.files?.mainImages || [];
  const subImages = req.files?.subImages || [];

  const images = [
    {
      mainImages: mainImages.length > 0 ? normalizePath(mainImages[0]) : null,
      subImages: subImages.map(img => normalizePath(img))
    }
  ];

  const gallery = await galleryModel.create({
    title,
    description,
    galleryType,
    images,
  });

  res.status(201).json({
    success: true,
    message: "Gallery created successfully",
    data: gallery,
  });
});




export const updateGallery = asyncHandler(async (req, res) => {
  const { galleryId, title, description, galleryType, imageIndexes } = req.body;

  if (!galleryId) {
    return res.status(400).json({ success: false, message: "galleryId is required" });
  }

  const gallery = await galleryModel.findById(galleryId);
  if (!gallery) {
    return res.status(404).json({ success: false, message: "Gallery not found" });
  }

 
  gallery.title = title ?? gallery.title;
  gallery.description = description ?? gallery.description;
  gallery.galleryType = galleryType ?? gallery.galleryType;


  const imageIndexesArray = imageIndexes ? JSON.parse(imageIndexes) : [];

  const mainImages = req.files?.mainImages || [];
  if (mainImages.length > 0) {
    gallery.images[0].mainImages = normalizePath(mainImages[0]);
  }

 
  const subImages = req.files?.subImages || [];
  let updatedSubImages = [...gallery.images[0].subImages]; 

  if (subImages.length > 0) {
    if (imageIndexesArray.length > 0) {
      
      imageIndexesArray.forEach((idx, i) => {
        if (idx >= 0 && idx < updatedSubImages.length) {
          updatedSubImages[idx] = normalizePath(subImages[i]); 
        } else {
          updatedSubImages.push(normalizePath(subImages[i])); 
        }
      });
    } else {
      
      updatedSubImages = [...updatedSubImages, ...subImages.map(img => normalizePath(img))];
    }

    gallery.images[0].subImages = updatedSubImages;
  }

  await gallery.save();

  res.status(200).json({
    success: true,
    message: "Gallery updated successfully",
    data: gallery,
  });
});



export const getGalleryById = asyncHandler(async (req, res) => {
  const { galleryId } = req.query;

  if (!galleryId) {
    return res.status(400).json({ success: false, message: "galleryId is required" });
  }

  const gallery = await galleryModel.findById(galleryId);

  if (!gallery) {
    return res.status(404).json({ success: false, message: "Gallery not found" });
  }

  res.status(200).json({
    success: true,
    message: "Gallery fetched successfully",
    data: gallery,
  });
});


export const deleteGallery = asyncHandler(async (req, res) => {
  const { galleryId, imageIndex, deleteMain } = req.query;

 
  if (!galleryId) {
    return res.status(400).json({
      success: false,
      message: "galleryId is required",
    });
  }

  const gallery = await galleryModel.findById(galleryId);
  if (!gallery) {
    return res.status(404).json({
      success: false,
      message: "Gallery not found",
    });
  }


  if (imageIndex !== undefined) {
    const idx = parseInt(imageIndex);

    if (
      idx >= 0 &&
      idx < gallery.images[0].subImages.length &&
      gallery.images[0].subImages.length > 0
    ) {
      
      await deleteFileFromUploads(gallery.images[0].subImages[idx]);

   
      gallery.images[0].subImages.splice(idx, 1);
      await gallery.save();

      return res.status(200).json({
        success: true,
        message: "Sub image deleted successfully",
        data: gallery,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid sub image index",
      });
    }
  }


  if (deleteMain === "true") {
    if (gallery.images[0].mainImages) {
      await deleteFileFromUploads(gallery.images[0].mainImages);
      gallery.images[0].mainImages = null;
      await gallery.save();

      return res.status(200).json({
        success: true,
        message: "Main image deleted successfully (sub images kept)",
        data: gallery,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Main image already deleted or not found",
      });
    }
  }


  if (gallery.images[0].mainImages) {
    await deleteFileFromUploads(gallery.images[0].mainImages);
  }

  if (gallery.images[0].subImages?.length > 0) {
    for (const img of gallery.images[0].subImages) {
      await deleteFileFromUploads(img);
    }
  }

  await gallery.deleteOne();

  res.status(200).json({
    success: true,
    message: "Entire gallery deleted successfully",
  });
});




export const getGalleryByFilter = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", galleryType = "" } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (galleryType) {
    query.galleryType = galleryType;
  }

  const total = await galleryModel.countDocuments(query);
  const galleries = await galleryModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    message: "Gallery data fetched successfully",
    data: galleries,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  });
});

import asyncHandler from "../../utils/asyncHandler.js";
import givingModel from "../../models/givingModel.js";
import { deleteFileFromUploads } from "../middleware/multer.js";
import { normalizePath } from "../../utils/normalizePath.js";


// export const createGivingBack = asyncHandler(async (req, res) => {
//   const { title, description, givingType } = req.body;

//   const images = req.files?.image ? req.files.image.map((file) => file.path) : [];

//   const givingBack = await GivingBack.create({
//     title,
//     description,
//     givingType,
//     image: images,
//   });

//   res.status(201).json({
//     success: true,
//     message: "GivingBack created successfully",
//     data: givingBack,
//   });
// });



export const createGivingBack = asyncHandler(async (req, res) => {
  const { title, description, givingType } = req.body;

 
  const mainImages = req.files?.mainImages || [];
  const subImages = req.files?.subImages || [];

  const images = [
    {
      mainImages: mainImages.length > 0 ? normalizePath(mainImages[0]) : null,
      subImages: subImages.map((img) => normalizePath(img)),
    },
  ];

  const givingBack = await givingModel.create({
    title,
    description,
    givingType,
    images,
  });

  res.status(201).json({
    success: true,
    message: "GivingBack created successfully",
    data: givingBack,
  });
});



export const updateGivingBack = asyncHandler(async (req, res) => {
  const { givingBackId, title, description, givingType, imageIndexes } = req.body;

  if (!givingBackId) {
    return res.status(400).json({ success: false, message: "givingBackId is required" });
  }

  const givingBack = await givingBackId.findById(givingBackId);
  if (!givingBack) {
    return res.status(404).json({ success: false, message: "GivingBack not found" });
  }


  givingBack.title = title ?? givingBack.title;
  givingBack.description = description ?? givingBack.description;
  givingBack.givingType = givingType ?? givingBack.givingType;

  const imageIndexesArray = imageIndexes ? JSON.parse(imageIndexes) : [];


  const mainImages = req.files?.mainImages || [];
  if (mainImages.length > 0) {
    givingBack.images[0].mainImages = normalizePath(mainImages[0]);
  }

  const subImages = req.files?.subImages || [];
  let updatedSubImages = [...givingBack.images[0].subImages];

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
    
      updatedSubImages = [...updatedSubImages, ...subImages.map((img) => normalizePath(img))];
    }

    givingBack.images[0].subImages = updatedSubImages;
  }

  await givingBack.save();

  res.status(200).json({
    success: true,
    message: "GivingBack updated successfully",
    data: givingBack,
  });
});



export const getGivingBackById = asyncHandler(async (req, res) => {
  const { givingBackId } = req.query;

  if (!givingBackId) {
    return res.status(400).json({ success: false, message: "givingBackId is required" });
  }

  const givingBack = await givingModel.findById(givingBackId);

  if (!givingBack) {
    return res.status(404).json({ success: false, message: "GivingBack not found" });
  }

  res.status(200).json({
    success: true,
    message: "GivingBack fetched successfully",
    data: givingBack,
  });
});



// export const deleteGivingBack = asyncHandler(async (req, res) => {
//   const { givingBackId } = req.query;

//   if (!givingBackId) {
//     return res.status(400).json({ success: false, message: "givingBackId is required" });
//   }

//   const givingBack = await GivingBack.findById(givingBackId);
//   if (!givingBack) {
//     return res.status(404).json({ success: false, message: "GivingBack not found" });
//   }


//   if (givingBack.image?.length > 0) {
//     for (const img of givingBack.image) {
//       deleteFileFromUploads(img);
//     }
//   }

//   await givingBack.deleteOne();

//   res.status(200).json({
//     success: true,
//     message: "GivingBack deleted successfully",
//     data:givingBack
//   });
// });



export const deleteGivingBack = asyncHandler(async (req, res) => {
  const { givingBackId, imageIndex, deleteMain } = req.query;

  if (!givingBackId) {
    return res.status(400).json({
      success: false,
      message: "givingBackId is required",
    });
  }

  const givingBack = await givingModel.findById(givingBackId);
  if (!givingBack) {
    return res.status(404).json({
      success: false,
      message: "GivingBack not found",
    });
  }

 
  if (imageIndex !== undefined) {
    const idx = parseInt(imageIndex);

    if (idx >= 0 && idx < givingBack.images[0].subImages.length) {
      await deleteFileFromUploads(givingBack.images[0].subImages[idx]);
      givingBack.images[0].subImages.splice(idx, 1);
      await givingBack.save();

      return res.status(200).json({
        success: true,
        message: "Sub image deleted successfully",
        data: givingBack,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid sub image index",
      });
    }
  }


  if (deleteMain === "true") {
    if (givingBack.images[0].mainImages) {
      await deleteFileFromUploads(givingBack.images[0].mainImages);
      givingBack.images[0].mainImages = null;
      await givingBack.save();

      return res.status(200).json({
        success: true,
        message: "Main image deleted successfully (sub images kept)",
        data: givingBack,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Main image already deleted or not found",
      });
    }
  }


  if (givingBack.images[0].mainImages) {
    await deleteFileFromUploads(givingBack.images[0].mainImages);
  }

  if (givingBack.images[0].subImages?.length > 0) {
    for (const img of givingBack.images[0].subImages) {
      await deleteFileFromUploads(img);
    }
  }

  await givingBack.deleteOne();

  res.status(200).json({
    success: true,
    message: "GivingBack record deleted successfully",
  });
});



export const getGivingBackByFilter = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", givingType = "" } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (givingType) {
    query.givingType = givingType;
  }

  const total = await givingModel.countDocuments(query);
  const givingBacks = await givingModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    message: "GivingBack data fetched successfully",
    data: givingBacks,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  });
});

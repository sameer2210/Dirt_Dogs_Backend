import asyncHandler from "../../utils/asyncHandler.js";
import serviceDetailModel from "../../models/servicedetailModel.js";
import { deleteFileFromUploads } from "../middleware/multer.js";


export const createServiceDetail = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const banners = req.files?.banners
    ? req.files.banners.map(file => file.path.replace(/\\/g, "/"))
    : [];

 
  const image = req.files?.image
    ? req.files.image[0].path.replace(/\\/g, "/")
    : "";


  const video = req.files?.video
    ? req.files.video[0].path.replace(/\\/g, "/")
    : "";

  const serviceDetail = await serviceDetailModel.create({
    title,
    description,
    banners,
    image,
    video,
  });

  res.status(201).json({
    success: true,
    message: "Service Detail created successfully",
    data: serviceDetail,
  });
});


export const updateServiceDetail = asyncHandler(async (req, res) => {
  const { serviceDetailId, title, description, bannerIndexes } = req.body;

  if (!serviceDetailId) {
    return res.status(400).json({ success: false, message: "serviceDetailId is required" });
  }

  const serviceDetail = await serviceDetailModel.findById(serviceDetailId);
  if (!serviceDetail) {
    return res.status(404).json({ success: false, message: "Service Detail not found" });
  }

  const bannerIndexesArray = bannerIndexes ? JSON.parse(bannerIndexes) : [];


  serviceDetail.title = title ?? serviceDetail.title;
  serviceDetail.description = description ?? serviceDetail.description;

  
  if (req.files?.banners && req.files.banners.length > 0) {
    const newBanners = req.files.banners.map(file => file.path);
    let updatedBanners = [...serviceDetail.banners];

    if (bannerIndexesArray.length > 0) {
      bannerIndexesArray.forEach((idx, i) => {
        if (idx >= 0 && idx < updatedBanners.length) {
          if (updatedBanners[idx]) {
            deleteFileFromUploads(updatedBanners[idx]);
          }
          updatedBanners[idx] = newBanners[i];
        } else {
          updatedBanners.push(newBanners[i]);
        }
      });
    } else {
      updatedBanners = [...updatedBanners, ...newBanners];
    }

    serviceDetail.banners = updatedBanners;
  }


  if (req.files?.image && req.files.image.length > 0) {
    if (serviceDetail.image) {
      deleteFileFromUploads(serviceDetail.image);
    }
    serviceDetail.image = req.files.image[0].path;
  }


  if (req.files?.video && req.files.video.length > 0) {
    if (serviceDetail.video) {
      deleteFileFromUploads(serviceDetail.video);
    }
    serviceDetail.video = req.files.video[0].path;
  }

  await serviceDetail.save();

  res.status(200).json({
    success: true,
    message: "Service Detail updated successfully",
    data: serviceDetail,
  });
});


export const getServiceDetailById = asyncHandler(async (req, res) => {
  const { serviceDetailId } = req.query;

  if (!serviceDetailId) {
    return res.status(400).json({ success: false, message: "serviceDetailId is required" });
  }

  const serviceDetail = await serviceDetailModel.findById(serviceDetailId);

  if (!serviceDetail) {
    return res.status(404).json({ success: false, message: "Service Detail not found" });
  }

  res.status(200).json({
    success: true,
    message: "Service Detail fetched successfully",
    data: serviceDetail,
  });
});



export const deleteServiceDetail = asyncHandler(async (req, res) => {
  const { serviceDetailId, bannerIndexes } = req.query;

  if (!serviceDetailId) {
    return res.status(400).json({ success: false, message: "serviceDetailId is required" });
  }

  const serviceDetail = await serviceDetailModel.findById(serviceDetailId);
  if (!serviceDetail) {
    return res.status(404).json({ success: false, message: "Service Detail not found" });
  }

  if (bannerIndexes) {
    const indexes = JSON.parse(bannerIndexes);
    indexes.forEach((idx) => {
      if (serviceDetail.banners[idx]) {
        deleteFileFromUploads(serviceDetail.banners[idx]);
        serviceDetail.banners.splice(idx, 1);
      }
    });

    await serviceDetail.save();
    return res.status(200).json({
      success: true,
      message: "Selected banners deleted successfully",
      data: serviceDetail,
    });
  }

  serviceDetail.banners.forEach(img => deleteFileFromUploads(img));
  if (serviceDetail.image) deleteFileFromUploads(serviceDetail.image);
  if (serviceDetail.video) deleteFileFromUploads(serviceDetail.video);

  await serviceDetail.deleteOne();

  res.status(200).json({
    success: true,
    message: "Service Detail deleted successfully",
  });
});



// export const getServiceDetailByFilter = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 10, search = "" } = req.query;

//   const query = {};

//   if (search) {
//     query.$or = [
//       { title: { $regex: search, $options: "i" } },
//       { description: { $regex: search, $options: "i" } },
//     ];
//   }


//   const total = await ServiceDetail.countDocuments(query);
//   const serviceDetails = await ServiceDetail.find(query)
//     .sort({ createdAt: -1 })
//     .skip((page - 1) * limit)
//     .limit(parseInt(limit));


    

//   res.status(200).json({
//     success: true,
//     message: "Service Details fetched successfully",
//     data: serviceDetails,
//     total,
//     totalPages: Math.ceil(total / limit),
//     currentPage: parseInt(page),
//   });
// });

export const getServiceDetailByFilter = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const total = await serviceDetailModel.countDocuments(query);
  let serviceDetails = await serviceDetailModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  serviceDetails = serviceDetails.map(detail => ({
    ...detail._doc,
    banners: detail.banners.map(img => img.replace(/\\/g, "/")),
  }));

  res.status(200).json({
    success: true,
    message: "Service Details fetched successfully",
    data: serviceDetails,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  });
});

import asyncHandler from "../../utils/asyncHandler.js";
import serviceModel from "../../models/serviceModel.js";
import { deleteFileFromUploads } from "../middleware/multer.js";
import serviceDetailModel from "../../models/servicedetailModel.js";



export const createService = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  // const images = req.files?.image ? req.files.image.map(file => file.path) : [];
  const images = req.files?.image
  ? req.files.image.map(file => file.path.replace(/\\/g, "/"))
  : [];


  const service = await serviceModel.create({
    title,
    description,
    image: images,
  });

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    data: service,
  });
});


export const updateService = asyncHandler(async (req, res) => {
  const { serviceId, title, description, imageIndexes } = req.body;

  if (!serviceId) {
    return res.status(400).json({ success: false, message: "serviceId is required" });
  }

  const service = await serviceDetailModel.findById(serviceId);
  if (!service) {
    return res.status(404).json({ success: false, message: "Service not found" });
  }

  const imageIndexesArray = imageIndexes ? JSON.parse(imageIndexes) : [];

 
  service.title = title ?? service.title;
  service.description = description ?? service.description;

 
  if (req.files?.image && req.files.image.length > 0) {
    const newImages = req.files.image.map(file => file.path);
    let updatedImages = [...service.image];

    if (imageIndexesArray.length > 0) {
      imageIndexesArray.forEach((idx, i) => {
        if (idx >= 0 && idx < updatedImages.length) {
          if (updatedImages[idx]) {
           
            deleteFileFromUploads(updatedImages[idx]);
          }
          updatedImages[idx] = newImages[i];
        } else {
          updatedImages.push(newImages[i]);
        }
      });
    } else {
      updatedImages = [...updatedImages, ...newImages];
    }

    service.image = updatedImages;
  }

  await service.save();

  res.status(200).json({
    success: true,
    message: "Service updated successfully",
    data: service,
  });
});


export const getServiceById = asyncHandler(async (req, res) => {
  const { serviceId } = req.query;

  if (!serviceId) {
    return res.status(400).json({ success: false, message: "serviceId is required" });
  }

  const service = await serviceModel.findById(serviceId);

  if (!service) {
    return res.status(404).json({ success: false, message: "Service not found" });
  }

  res.status(200).json({
    success: true,
    message: "Service fetched successfully",
    data: service,
  });
});



export const deleteService = asyncHandler(async (req, res) => {
  const { serviceId, imageIndexes } = req.query;

  if (!serviceId) {
    return res.status(400).json({ success: false, message: "serviceId is required" });
  }

  const service = await serviceModel.findById(serviceId);
  if (!service) {
    return res.status(404).json({ success: false, message: "Service not found" });
  }


  if (imageIndexes) {
    const indexes = JSON.parse(imageIndexes);
    indexes.forEach((idx) => {
      if (service.image[idx]) {
        deleteFileFromUploads(service.image[idx]);
        service.image.splice(idx, 1);
      }
    });

    await service.save();
    return res.status(200).json({
      success: true,
      message: "Selected images deleted successfully",
      data: service,
    });
  }

  service.image.forEach(img => deleteFileFromUploads(img));
  await service.deleteOne();

  res.status(200).json({
    success: true,
    message: "Service deleted successfully",
  });
});



// export const getServiceByFilter = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 10, search = "" } = req.query;

//   const query = {};

//   if (search) {
//     query.$or = [
//       { title: { $regex: search, $options: "i" } },
//       { description: { $regex: search, $options: "i" } },
//     ];
//   }

//   const total = await Service.countDocuments(query);
//   const services = await Service.find(query)
//     .sort({ createdAt: -1 })
//     .skip((page - 1) * limit)
//     .limit(parseInt(limit));

//   res.status(200).json({
//     success: true,
//     message: "Services fetched successfully",
//     data: services,
//     total,
//     totalPages: Math.ceil(total / limit),
//     currentPage: parseInt(page),
//   });
// });


export const getServiceByFilter = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const service = await serviceModel.findOne(query).sort({ createdAt: -1 });

  if (!service) {
    return res.status(404).json({ success: false, message: "Service not found" });
  }

  const servicedetail = await serviceDetailModel.find();

  service._doc.serviceDetailModel=servicedetail

  
  service.image = service.image.map((img) => img.replace(/\\/g, "/"));

  res.status(200).json({
    success: true,
    message: "Service fetched successfully",
    data: service,
  });
});



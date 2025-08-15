import asyncHandler from "../../utils/asyncHandler.js";
import financingModel from "../../models/financingModel.js";
import { deleteFileFromUploads } from "../middleware/multer.js";
import { normalizePath } from "../../utils/normalizePath.js";


// export const createFinancing = asyncHandler(async (req, res) => {
//   const { title, description } = req.body;

//   if (!title) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Title is required" });
//   }

//   const icon = req.file?.path;

//   const financing = await Financing.create({ title, description, icon });

//   res.status(201).json({
//     success: true,
//     message: "Financing created successfully",
//     data: financing,
//   });
// });


export const createFinancing = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }

  const icon = req.file ? normalizePath(req.file) : null;

  const financing = await financingModel.create({ title, description, icon });

  res.status(201).json({
    success: true,
    message: "Financing created successfully",
    data: financing,
  });
});



export const updateFinancing = asyncHandler(async (req, res) => {
  const { financingId, title, description } = req.body;

  if (!financingId) {
    return res
      .status(400)
      .json({ success: false, message: "financingId is required" });
  }

  const financing = await financingModel.findById(financingId);
  if (!financing) {
    return res
      .status(404)
      .json({ success: false, message: "Financing not found" });
  }

  
  if (req.file?.path) {
    if (financing.icon) {
      await deleteFileFromUploads(financing.icon);
    }
    financing.icon = normalizePath(req.file); 
  }


  financing.title = title ?? financing.title;
  financing.description = description ?? financing.description;

  await financing.save();

  res.status(200).json({
    success: true,
    message: "Financing updated successfully",
    data: financing,
  });
});



export const getFinancingById = asyncHandler(async (req, res) => {
  const { financingId } = req.query;

  if (!financingId) {
    return res
      .status(400)
      .json({ success: false, message: "financingId is required" });
  }

  const financing = await financingModel.findById(financingId);
  if (!financing) {
    return res
      .status(404)
      .json({ success: false, message: "Financing not found" });
  }

  res.status(200).json({ success: true, data: financing });
});


export const getFinancingByFilter = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;

  const query = {
    title: { $regex: search, $options: "i" },
  };

  const total = await financingModel.countDocuments(query);
  const financings = await financingModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: financings,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});


export const deleteFinancing = asyncHandler(async (req, res) => {
  const { financingId } = req.query;

  if (!financingId) {
    return res
      .status(400)
      .json({ success: false, message: "financingId is required" });
  }

  const financing = await financingModel.findById(financingId);
  if (!financing) {
    return res
      .status(404)
      .json({ success: false, message: "Financing not found" });
  }

  if (financing.icon) {
    await deleteFileFromUploads(financing.icon);
  }

  await financing.deleteOne();

  res
    .status(200)
    .json({
         success: true,
          message: "Financing deleted successfully",
          data:financing
         });
});

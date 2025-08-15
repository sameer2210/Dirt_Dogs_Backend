import asyncHandler from "../../utils/asyncHandler.js"; 
import testimonialModel from "../../models/testimonialModel.js"; 


export const createTestimonial = asyncHandler(async (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({
      success: false,
      message: "Name and message are required",
    });
  }

  const messageArray = Array.isArray(message) ? message : [message];

  const testimonial = await testimonialModel.create({
    name,
    message: messageArray,
  });

  res.status(201).json({
    success: true,
    message: "Testimonial created successfully",
    data: testimonial,
  });
});


export const updateTestimonial = asyncHandler(async (req, res) => {
  const { testimonialId, name, message, messageIndexes } = req.body;

  if (!testimonialId) {
    return res.status(400).json({
      success: false,
      message: "testimonialId is required",
    });
  }

  const testimonial = await testimonialModel.findById(testimonialId);

  if (!testimonial) {
    return res.status(404).json({
      success: false,
      message: "Testimonial not found",
    });
  }

  testimonial.name = name ?? testimonial.name;

 
  if (message) {
    const messageArray = Array.isArray(message) ? message : JSON.parse(message);
    const indexes = messageIndexes ? JSON.parse(messageIndexes) : [];

    let updatedMessages = [...testimonial.message];

    if (indexes.length > 0) {
      indexes.forEach((idx, i) => {
        if (idx >= 0 && idx < updatedMessages.length) {
          updatedMessages[idx] = messageArray[i] ?? updatedMessages[idx];
        } else {
          updatedMessages.push(messageArray[i]);
        }
      });
    } else {
      updatedMessages = [...updatedMessages, ...messageArray];
    }

    testimonial.message = updatedMessages;
  }

  await testimonial.save();

  res.status(200).json({
    success: true,
    message: "Testimonial updated successfully",
    data: testimonial,
  });
});



export const getTestimonialById = asyncHandler(async (req, res) => {
  const { testimonialId } = req.query;

  if (!testimonialId) {
    return res.status(400).json({
      success: false,
      message: "testimonialId is required",
    });
  }

  const testimonial = await testimonialModel.findById(testimonialId);

  if (!testimonial) {
    return res.status(404).json({
      success: false,
      message: "Testimonial not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Testimonial fetched successfully",
    data: testimonial,
  });
});




export const getTestimonialByFilter = asyncHandler(async (req, res) => {
  let { search, page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);


  let query = {};

  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { message: { $elemMatch: { $regex: search, $options: "i" } } },
      ],
    };
  }

  const totalCount = await testimonialModel.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  const testimonials = await testimonialModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    message: "Testimonials fetched successfully",
    data: testimonials,
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    },
  });
});



export const deleteTestimonial = asyncHandler(async (req, res) => {
  const { testimonialId, messageIndexes } = req.query;

  if (!testimonialId) {
    return res.status(400).json({
      success: false,
      message: "testimonialId is required",
    });
  }

  const testimonial = await testimonialId.findById(testimonialId);

  if (!testimonial) {
    return res.status(404).json({
      success: false,
      message: "Testimonial not found",
    });
  }

 
  if (messageIndexes) {
    const indexes = JSON.parse(messageIndexes);
    testimonial.message = testimonial.message.filter((_, idx) => !indexes.includes(idx));
    await testimonial.save();

    return res.status(200).json({
      success: true,
      message: "Selected testimonial messages deleted successfully",
      data: testimonial,
    });
  }

  await testimonial.deleteOne();

  res.status(200).json({
    success: true,
    message: "Testimonial deleted successfully",
    data:testimonial
  });
});

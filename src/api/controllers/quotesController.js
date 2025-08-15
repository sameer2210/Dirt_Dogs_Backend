import asyncHandler from "../../utils/asyncHandler.js";
import quotesModel from "../../models/quotesModel.js";


export const createQuote = asyncHandler(async (req, res) => {
  const { name, phone, email, servicesInterestedType, message, streetAddress, city, state } = req.body;

  const quote = await quotesModel.create({
    name,
    phone,
    email,
    servicesInterestedType,
    message,
    streetAddress,
    city,
    state,
  });

  res.status(201).json({
    success: true,
    message: "Quote created successfully",
    data: quote,
  });
});


export const updateQuote = asyncHandler(async (req, res) => {
  const { quoteId, name, phone, email, servicesInterestedType, message, streetAddress, city, state } = req.body;

  if (!quoteId) {
    return res.status(400).json({ success: false, message: "quoteId is required" });
  }

  const quote = await quotesModel.findById(quoteId);
  if (!quote) {
    return res.status(404).json({ success: false, message: "Quote not found" });
  }


  quote.name = name ?? quote.name;
  quote.phone = phone ?? quote.phone;
  quote.email = email ?? quote.email;
  quote.servicesInterestedType = servicesInterestedType ?? quote.servicesInterestedType;
  quote.message = message ?? quote.message;
  quote.streetAddress = streetAddress ?? quote.streetAddress;
  quote.city = city ?? quote.city;
  quote.state = state ?? quote.state;

  await quote.save();

  res.status(200).json({
    success: true,
    message: "Quote updated successfully",
    data: quote,
  });
});


export const getQuoteById = asyncHandler(async (req, res) => {
  const { quoteId } = req.query;

  if (!quoteId) {
    return res.status(400).json({ success: false, message: "quoteId is required" });
  }

  const quote = await Quote.findById(quoteId);

  if (!quote) {
    return res.status(404).json({ success: false, message: "Quote not found" });
  }

  res.status(200).json({
    success: true,
    message: "Quote fetched successfully",
    data: quote,
  });
});


export const deleteQuote = asyncHandler(async (req, res) => {
  const { quoteId } = req.query;

  if (!quoteId) {
    return res.status(400).json({ success: false, message: "quoteId is required" });
  }

  const quote = await quotesModel.findById(quoteId);
  if (!quote) {
    return res.status(404).json({ success: false, message: "Quote not found" });
  }

  await quote.deleteOne();

  res.status(200).json({
    success: true,
    message: "Quote deleted successfully",
  });
});


export const getQuoteByFilter = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", serviceType = "" } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
      { state: { $regex: search, $options: "i" } },
    ];
  }

  if (serviceType) {
    query.servicesInterestedType = serviceType;
  }

  const total = await quotesModel.countDocuments(query);
  const quotes = await quotesModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    message: "Quotes fetched successfully",
    data: quotes,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  });
});

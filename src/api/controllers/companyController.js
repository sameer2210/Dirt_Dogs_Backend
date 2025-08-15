import asyncHandler from "../../utils/asyncHandler.js";
import companyModel from "../../models/companyModel.js";
import { deleteFileFromUploads } from "../middleware/multer.js";


export const getCompany = asyncHandler(async (req, res) => {
  const company = await companyModel.findOne();

  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Company data not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Company data fetched successfully",
    data: company,
  });
});





export const updateCompany = asyncHandler(async (req, res) => {
  const {
    companyId,
    name,
    address,
    whatsappNumber,
    number,
    email,
    about,
    privacyStatement,
    termsOfuse,
    noticeToCustomers,
  } = req.body;

  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: "companyId is required",
    });
  }

  const company = await companyModel.findById(companyId);
  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Company not found",
    });
  }

 
  company.name = name ?? company.name;
  company.address = address ?? company.address;
  company.whatsappNumber = whatsappNumber ?? company.whatsappNumber;
  company.number = number ?? company.number;
  company.email = email ?? company.email;
  company.about = about ?? company.about;
  company.privacyStatement = privacyStatement ?? company.privacyStatement;
  company.termsOfuse = termsOfuse ?? company.termsOfuse;
  company.noticeToCustomers = noticeToCustomers ?? company.noticeToCustomers;

 
  if (req.files?.footerIcon && req.files.footerIcon.length > 0) {
   
    if (company.footerIcon) {
      await deleteFileFromUploads(company.footerIcon);
    }

    company.footerIcon = req.files.footerIcon[0].path; 
  }

  await company.save();

  res.status(200).json({
    success: true,
    message: "Company details updated successfully",
    data: company,
  });
});


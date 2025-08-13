import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    whatsappNumber: {
      type: Number,
    },
    number: {
      type: Number,
    },
    email: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
    },
    footerIcon: {
      type: String,
      trim: true,
    },
    privacyStatement: {
      type: String,
      trim: true,
    },
    termsOfuse: {
      type: String,
      trim: true,
    },
    noticeToCustomers: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

export default Company;


const createDefaultCompany = async () => {
  const existing = await Company.findOne();
  if (!existing) {
    const companyData = {
      name: "ABC Pvt Ltd",
      address: "123 Main Street, Colorado, USA",
      whatsappNumber: 9876543210,
      number: 1234567890,
      email: "info@abccompany.com",
      about:
        "ABC Pvt Ltd is a leading company providing exceptional services in various domains with a customer-centric approach.",
      footerIcon: "https://example.com/footer-icon.png",
      privacyStatement:
        "We value your privacy and ensure your data is protected under strict policies.",
      termsOfuse:
        "By using our services, you agree to comply with our terms and conditions.",
      noticeToCustomers:
        "Important notice to customers about service updates and announcements.",
    };

    await Company.create(companyData);
    console.log("Default Company created successfully.");
  } else {
    console.log("Default Company already exists.");
  }
};

export { createDefaultCompany };


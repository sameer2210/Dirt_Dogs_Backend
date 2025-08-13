import mongoose from "mongoose";

const serviceDetailSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    banners: [
      {
        type: String, 
      },
    ],
    image: {
      type: String, 
    },
    video: {
      type: String, 
    },
  },
  { timestamps: true }
);

const ServiceDetail = mongoose.model("ServiceDetail", serviceDetailSchema);

export default ServiceDetail;

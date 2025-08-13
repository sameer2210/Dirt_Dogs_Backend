import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: [
      {
        type: String, 
      },
    ],
    
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;

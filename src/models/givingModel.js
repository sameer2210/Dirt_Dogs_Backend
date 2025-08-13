import mongoose from "mongoose";

const givingBackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    givingType: {
      type: String,
      enum: [
        "Elizabeth High School Baseball Field",
        "Behn Family Field in Parker Colorado",
        "at Ponderosa High School",
        "Daltons Moon Foundation",
        "Kiowa Rodeo",
        "Little League Baseball",
      ],
    },
    images: [
      {
        mainImages: {
          type: String, 
        },
        subImages: [
          {
            type: String, 
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const GivingBack = mongoose.model("GivingBack", givingBackSchema);

export default GivingBack;

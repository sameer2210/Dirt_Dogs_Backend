import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    servicesInterestedType: [
      {
        type: String,
        enum: [
          "Horse Arena",
          "Barn Pad",
          "Driveway",
          "Erosion Matting",
          "Finish Grade",
          "Road Base",
          "Road Grading",
          "Foundation",
          "Sand",
          "Trenching",
          "Livestock Burial",
          "Other - Explain in Notes"
        ],
      },
    ],
    message: {
      type: String,
      trim: true,
    },
    streetAddress: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Quote = mongoose.model("Quote", quoteSchema);

export default Quote;

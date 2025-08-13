import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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
    galleryType: {
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
        "Other - Explain in Notes",
      ],
    },
  },
  { timestamps: true }
);

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;

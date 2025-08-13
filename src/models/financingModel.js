import mongoose from "mongoose";

const financingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
   icon:{
    type:String
   }
  },
  { timestamps: true }
);

const Financing = mongoose.model("Financing", financingSchema);

export default Financing;

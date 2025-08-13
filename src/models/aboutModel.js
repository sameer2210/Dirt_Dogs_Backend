import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
   companyHistory:
    {
     title:{
        type:String,
        trim:true
     },
     description:{
        type:String,
        trim:true
     }
    },


    customerTestimonials: [
      {
        name: {
         type: String,
         trim: true 
        },
        message: {
         type: String,
          trim: true 
        },
      },
    ],
    commitmentToQuality: {
      title: { 
      type: String,
      trim: true
      },
      description: { 
      type: String,
      trim: true
     },
    },
    loyaldogsImage: [
      {
        type: String, 
      },
    ],
    serviceAreas: [
      {
        type: String,
        trim: true,
      },
    ],
    ownerInfo: {
      name: { 
    type: String,
     trim: true 
    },
   image: { 
    type: String,
     trim: true },
    phone: { 
    type: String,
     trim: true 
    },
    email: {
     type: String,
     trim: true
     },
    address: {
     type: String,
     trim: true 
    },
    },
  },
  { timestamps: true }
);

const About = mongoose.model("About", aboutSchema);

export default About;



const createDefaultAbout = async () => {
  const existing = await About.findOne();
  if (!existing) {
    const aboutData = {
     companyHistory: {
        title: "Our Journey",
        description:
          "We started our company with a passion for quality and service excellence, and have grown into a trusted name in excavation and construction services.",
      },

      customerTestimonials: [
        {
          name: "John Doe",
          feedback: "Excellent service and very professional team!",
        },
        {
          name: "Jane Smith",
          feedback: "Great experience with Dirt Dogs Excavation.",
        },
      ],
      commitmentToQuality: {
        title: "Our Quality Commitment",
        description:
          "We ensure every project meets the highest standards of safety and customer satisfaction.",
      },
     
      loyaldogsImage: [
        "https://example.com/dog1.png",
        "https://example.com/dog2.png",
      ],
      serviceAreas: ["Colorado Springs", "Denver", "Pueblo"],
      ownerInfo: {
        name: "Michael Johnson",
        image: "https://example.com/owner.png",
        phone: "1234567890",
        email: "owner@example.com",
        address: "123 Main Street, Colorado, USA",
      },
    };

    await About.create(aboutData);
    console.log("Default About created successfully.");
  } else {
    console.log("Default About already exists.");
  }
};

export { createDefaultAbout };

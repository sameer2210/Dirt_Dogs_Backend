import mongoose from "mongoose";

const homeSchema = new mongoose.Schema({
  topImage: [
    {
      type: String,
    },
  ],
  heading: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: Number,
  },
  email: {
    type: String,
  },
  homeDescription: {
    type: String,
    trim: true,
  },
  icon: {
    type: String,
  },
  commitment: {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  homeIcon: {
    type: String,
  },
}, { timestamps: true });

const Home = mongoose.model("Home", homeSchema);

export default Home;


const createDefaultHome = async () => {
  const existing = await Home.findOne();
  if (!existing) {
    const homeData = {
      topImage: [
        "https://example.com/home1.jpg",
        "https://example.com/home2.jpg",
        "https://example.com/home3.jpg",
      ],
      heading: "Welcome to Dirt Dogs Excavation",
      phoneNumber: 1234567890,
      email: "contact@dirtdogs.com",
      homeDescription:
        "We are a professional excavation company committed to delivering high-quality services in Colorado and nearby areas.",
      icon: "https://example.com/icon.png",
      commitment: {
        title: "Our Commitment",
        description:
          "Providing top-notch excavation services with a focus on safety, quality, and customer satisfaction.",
      },
      homeIcon: "https://example.com/homeicon.png",
    };

    await Home.create(homeData);
    console.log("Default Home created successfully.");
  } else {
    console.log("Default Home already exists.");
  }
};

export { createDefaultHome };

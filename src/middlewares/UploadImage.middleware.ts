import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const uploadImage = async (req, res, next) => {
  const { image_file } = req.body;

  if (!image_file) return next();

  try {
    const result = await cloudinary.uploader.upload(image_file, {
      folder: "area15",
      secure: true,
    });
    req.body = { ...req.body, image_url: result.secure_url };
    next();
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: false,
    });
  }
};

export default uploadImage;

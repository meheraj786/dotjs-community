import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary using credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary and delete it locally afterwards
 * @param localFilePath - Path to the local file
 * @returns Cloudinary upload result or null if failed
 */
const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const result: UploadApiResponse = await cloudinary.uploader.upload(
      localFilePath,
      { resource_type: "auto" } // auto-detects file type (image, video, etc.)
    );

    console.log("✅ File uploaded successfully:", result.url);

    // Remove local file after successful upload
    fs.unlinkSync(localFilePath);

    return result;
  } catch (error) {
    // Delete local file even if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("❌ Cloudinary upload failed:", error);
    return null;
  }
};

export default uploadOnCloudinary;

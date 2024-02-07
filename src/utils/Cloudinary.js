import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_FOLDER } from "../constant.js";
import fs from 'fs'
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: CLOUDINARY_FOLDER,
    });

    fs.unlinkSync(localFilePath);

    return response.url
  } catch (error) {
    fs.unlinkSync(localFilePath);
    throw new ApiError(500,error.message || "Something went wrong on cloudinary")
  }
};

const uploadVideoOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'video',
      folder: CLOUDINARY_FOLDER+"/PropertyVideos",
    });

    fs.unlinkSync(localFilePath);

    return response.url
  } catch (error) {
    
    fs.unlinkSync(localFilePath);
    throw new ApiError(500,error.message || "Something went wrong on cloudinary")
  }
};

const deleteOldImageFileInCloudinary = async (oldUrl) => {
  try {
    let publicIdToDelete = oldUrl.split("/BlueorbHousing").pop().split(".")[0];
    publicIdToDelete = "BlueorbHousing"+publicIdToDelete
    await cloudinary.uploader.destroy(
      publicIdToDelete,
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          throw new ApiError(401, "Error in Uploading to cloud");
        }
      }
    );
  } catch (error) {
    return null;
  }
};
const deleteOldVideoFileInCloudinary = async (oldUrl) => {
  try {
    let publicIdToDelete = oldUrl.split("/BlueorbHousing").pop().split(".")[0];
    publicIdToDelete = "BlueorbHousing"+publicIdToDelete
    console.log("PublicIdToDelete", publicIdToDelete)
    await cloudinary.uploader.destroy(
      publicIdToDelete,
      { resource_type: "video" },
      (error, result) => {
        if (error) {
          throw new ApiError(401, "Error in Uploading to cloud");
        }
      }
    );
  } catch (error) {
    console.log(error.message)
    return null;
  }
};

export { uploadImageOnCloudinary,uploadVideoOnCloudinary, deleteOldImageFileInCloudinary, deleteOldVideoFileInCloudinary };

import { Property } from "../models/Property.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadImageOnCloudinary,
  uploadVideoOnCloudinary,
} from "../utils/Cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = (req, res) => {
  console.log(req.files);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Property Routes are working"));
};

const createProperty = asyncHandler(async (req, res) => {
  //1. Destructure Property data from req.body
  //2. Check if the required data is provided
  //3. Upload Images and videos on cloudinary, apply conditions to check if the data is provided or not
  //4. Create entry in database
  //5. Check is property is created
  //6. return response

  //1.
  const {
    name,
    description,
    address,
    city,
    state,
    pincode,
    availableFrom,
    amount,
    propertyType,
    rooms,
    bathrooms,
    area,
    transactionType,
    furnished,
    balconies,
    parking,
    yearOfConstruction,
    tenantType,
    gym,
    visitorParking,
    garden,
    swimmingPool,
    clubHouse,
    nearbySchool,
    nearbyHospital,
    nearbyBusStation,
    nearbyRailwayStation,
  } = req.body;

  //2.
  if (
    [
      name,
      description,
      address,
      city,
      state,
      pincode,
      availableFrom,
      amount,
      propertyType,
      rooms,
      bathrooms,
      area,
      transactionType,
      furnished,
      balconies,
      parking,
      yearOfConstruction,
      tenantType,
      nearbySchool,
      nearbyHospital,
      nearbyBusStation,
      nearbyRailwayStation,
    ].some((item) => item?.trim() === "")
  ) {
    throw new ApiError(400, "Please enter all the required fields");
  }

  try {
    //3.
    let imagesLocalPathArray;
    let videosLocalPathArray;

    if (
      req.files &&
      Array.isArray(req.files.images) &&
      req.files.images.length > 0
    ) {
      imagesLocalPathArray = req.files.images.map((file) => file.path);
    } else {
      throw new ApiError(400, "Property Images are required");
    }

    if (
      req.files &&
      Array.isArray(req.files.videos) &&
      req.files.videos.length > 0
    ) {
      videosLocalPathArray = req.files.videos?.map((file) => file.path);
    }

    const cloudinaryImageUrlArray = await Promise.all(
      imagesLocalPathArray.map((image) => uploadImageOnCloudinary(image))
    );

    if (!cloudinaryImageUrlArray.length) {
      throw new ApiError(
        500,
        "Something went wrong while uploading images on cloudinary"
      );
    }

    let cloudinaryVideoUrlArray;

    if (videosLocalPathArray) {
      const cloudinaryVideoUrlArray = await Promise.all(
        videosLocalPathArray.map((video) => uploadVideoOnCloudinary(video))
      );
    }

    //4.
    const property = await Property.create({
      name,
      description,
      address,
      city,
      state,
      pincode,
      availableFrom,
      amount,
      propertyType,
      rooms,
      bathrooms,
      area,
      transactionType,
      furnished,
      balconies,
      parking,
      yearOfConstruction,
      tenantType,
      images: cloudinaryImageUrlArray,
      videos: cloudinaryVideoUrlArray ? cloudinaryVideoUrlArray : [],
      gym,
      visitorParking,
      garden,
      swimmingPool,
      clubHouse,
      nearbySchool,
      nearbyHospital,
      nearbyBusStation,
      nearbyRailwayStation,
      owner: req.user._id,
    });

    //5.
    if (!property) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    //6.
    return res
      .status(200)
      .json(new ApiResponse(200, property, "Property Created Successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while uploading images on cloudinary"
    );
  }
});

export { healthCheck, createProperty };

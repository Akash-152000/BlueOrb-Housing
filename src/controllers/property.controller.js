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

const deleteProperty = asyncHandler(async (req, res) => {
  //1. Get the id from params
  //2. Delete the property
  //3. Return the response

  //1.
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Provide id of property to delete");
  }

  //2.
  const propertyToDelete = await Property.findByIdAndDelete(id);

  if (!propertyToDelete) {
    throw new ApiError(400, "Property not found");
  }

  //3.
  return res
    .status(200)
    .json(new ApiResponse(200, "Property has been deleted"));
});

const getMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.user._id });

  if (!properties) {
    throw new ApiError(404, "Properties not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, properties, "Properties Fetched Succesfully"));
});

const getSingleProperty = asyncHandler(async (req, res) => {
  //1. Get the id from params
  //2. Fetch the property
  //3. Return the response

  //1.
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Provide id of property to find");
  }

  //2.
  const property = await Property.findById(id);

  if (!property) {
    throw new ApiError(400, "Property not found");
  }

  //3.
  return res
    .status(200)
    .json(new ApiResponse(200, property, "Property has been feteched"));
});

const getAllProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find();

  if (!properties) {
    throw new ApiError(500, "Internal server error");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, properties, "All Properties fetched succesfully")
    );
});

const updateproperty = asyncHandler(async (req, res) => {
  //1. Get the id from params
  //2. Destrucutre the data from the body
  //3. Check if atleaset on field is provided
  //4. Find and update the database
  //5. return response

  //2.
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

  const providedDataArray = [
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
  ];

  //3.
  if (
    !providedDataArray.some((item) => item !== undefined && item?.trim() !== "")
  ) {
    throw new ApiError(400, "At least one field is required");
  }

  const providedDataArrayFieldName = [
    "name",
    "description",
    "address",
    "city",
    "state",
    "pincode",
    "availableFrom",
    "amount",
    "propertyType",
    "rooms",
    "bathrooms",
    "area",
    "transactionType",
    "furnished",
    "balconies",
    "parking",
    "yearOfConstruction",
    "tenantType",
    "gym",
    "visitorParking",
    "garden",
    "swimmingPool",
    "clubHouse",
    "nearbySchool",
    "nearbyHospital",
    "nearbyBusStation",
    "nearbyRailwayStation",
  ];

  const updateObject = {};

  providedDataArrayFieldName.forEach((item) => {
    const value = req.body[item];
    if (value !== undefined && value.trim() !== "") {
      updateObject[item] = value;
    }
  });

  const updatedProperty = await Property.findByIdAndUpdate(
    req.params?.id,
    {
      $set: updateObject,
    },
    { new: true, runValidators: true }
  );

  if (!updatedProperty) {
    throw new ApiError(400, "Property not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProperty, "Property Updated Successfully")
    );
});

const updatePropertyImages = asyncHandler(async (req, res) => {
  //1. Get the images from req.file
  //2. Find by Id and Update the database
  //3. Return response

  try {
    //1.
    let imagesLocalPathArray;

    if (
      req.files &&
      Array.isArray(req.files.images) &&
      req.files.images.length > 0
    ) {
      imagesLocalPathArray = req.files.images.map((file) => file.path);
    } else {
      throw new ApiError(400, "Please Choose Images to add");
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

    //2.
    const property = await Property.findById(req.params.id);

    property.images = property.images.concat(cloudinaryImageUrlArray)

    await property.save()

    //3.
    return res
      .status(200)
      .json(new ApiResponse(200, property, "Images Updated Successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while uploading images on cloudinary"
    );
  }
});

const updatePropertyVideos = asyncHandler(async(req,res)=>{

})

export {
  healthCheck,
  createProperty,
  deleteProperty,
  getMyProperties,
  getSingleProperty,
  getAllProperties,
  updateproperty,
  updatePropertyImages,
  updatePropertyVideos
};

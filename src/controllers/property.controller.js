import { Property } from "../models/Property.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteOldImageFileInCloudinary,
  deleteOldVideoFileInCloudinary,
  uploadImageOnCloudinary,
  uploadVideoOnCloudinary,
} from "../utils/Cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

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
      cloudinaryVideoUrlArray = await Promise.all(
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

  const propertyToDelete = await Property.findById(id);

  if (!propertyToDelete) {
    throw new ApiError(400, "Property not found");
  }

  // Delete older images and videos from cloudinary as well
  const images = propertyToDelete.images;
  const videos = propertyToDelete.videos;

  if (images.length > 0) {
    await Promise.all(
      images.map(async (oldUrl) => {
        await deleteOldImageFileInCloudinary(oldUrl);
      })
    );
  }

  if (videos.length > 0) {
    await Promise.all(
      videos.map(async (oldUrl) => {
        await deleteOldVideoFileInCloudinary(oldUrl);
      })
    );
  }

  const propertyDeleted = await Property.findByIdAndDelete(id);

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
  //3. Add the user to views array
  //4. Return the response

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

  //4.
  const currentUserId = req.user._id;

  if (!property.views.includes(currentUserId)) {
    property.views.push(currentUserId);
    await property.save();
  }

  //3.
  return res
    .status(200)
    .json(new ApiResponse(200, property, "Property has been feteched"));
});

const getAllProperties = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 4,
    city,
    range,
    sortBy,
    sortType,
    type,
    transactionType,
    availableFrom,
  } = req.query;

  try {
    const baseQuery = {};
    if (city) {
      baseQuery.city = { $regex: city, $options: "i" };
    }

    if (range) {
      const amountParts = range.split("-");
      console.log(amountParts);

      if (amountParts.length === 2) {
        // If amount is provided as a range, search for values within the range
        const lowerBound = parseInt(amountParts[0].trim(), 10);
        const upperBound = parseInt(amountParts[1].trim(), 10);

        if (!isNaN(lowerBound) && !isNaN(upperBound)) {
          // Only include the range filter if both lower and upper bounds are valid numbers
          baseQuery.amount = { $gte: lowerBound, $lte: upperBound };
        }
      } else {
        // If amount is provided as a single value, search for an exact match
        baseQuery.amount = { $eq: amount };
      }
    }

    if (type) {
      baseQuery.propertyType = { $regex: type, $options: "i" };
    }

    if (transactionType) {
      baseQuery.transactionType = { $regex: transactionType, $options: "i" };
    }

    if (availableFrom) {
      console.log(new Date(availableFrom));
      baseQuery.availableFrom = { $gte: availableFrom };
    }

    console.log(baseQuery);

    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
    }

    const properties = await Property.aggregatePaginate(
      Property.aggregate([
        { $match: { ...baseQuery } },
        { $sort: sortOptions },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) },
      ])
    );

    //   await Property.find();

    if (!properties) {
      throw new ApiError(500, "Internal server error");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, properties, "All Properties fetched succesfully")
      );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: error.message,
    });
  }
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
      throw new ApiError(404, "Please Choose Images to add");
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

    if (!property) {
      throw new ApiError(400, "Property not found");
    }

    property.images = property.images.concat(cloudinaryImageUrlArray);

    await property.save();

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

const updatePropertyVideos = asyncHandler(async (req, res) => {
  //1. Get the videos from req.file
  //2. Find by Id and Update the database
  //3. Return response

  try {
    //1.
    let videosLocalPathArray;

    if (
      req.files &&
      Array.isArray(req.files.videos) &&
      req.files.videos.length > 0
    ) {
      videosLocalPathArray = req.files.videos.map((file) => file.path);
    } else {
      throw new ApiError(404, "Please Choose videos to add");
    }

    const cloudinaryVideoUrlArray = await Promise.all(
      videosLocalPathArray.map((video) => uploadVideoOnCloudinary(video))
    );

    if (!cloudinaryVideoUrlArray.length) {
      throw new ApiError(
        500,
        "Something went wrong while uploading videos on cloudinary"
      );
    }

    //2.
    const property = await Property.findById(req.params.id);

    if (!property) {
      throw new ApiError(400, "Property not found");
    }

    property.videos = property.videos.concat(cloudinaryVideoUrlArray);

    await property.save();

    //3.
    return res
      .status(200)
      .json(new ApiResponse(200, property, "videos Updated Successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while uploading videos on cloudinary"
    );
  }
});

const deletePropertyImages = asyncHandler(async (req, res) => {
  //1. Get the array containing urls to delete from req.body
  //2. Check if array is empty
  //3. Find the property by Id
  //4. Check if property exists or not
  //5. Check if Image array database has atleast 1 image
  //6. Filter the recieved urls from database
  //7. Save
  //8. Return response

  //1.
  const { receivedUrlArray } = req.body;

  //2.
  if (!receivedUrlArray || !receivedUrlArray.length) {
    throw new ApiError(404, "Please provide images to delete");
  }

  //3.
  const property = await Property.findById(req.params.id);

  //4.
  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  //5.
  if (property?.images.length - receivedUrlArray.length <= 0) {
    throw new ApiError(404, "Atleast One Image is required");
  }

  // Delete older images from cloudinary as well
  await Promise.all(
    receivedUrlArray.map(async (oldUrl) => {
      await deleteOldImageFileInCloudinary(oldUrl);
    })
  );

  //6.
  property.images = property.images.filter(
    (image) => !receivedUrlArray.includes(image)
  );

  //7.
  await property.save();

  //8.
  return res
    .status(200)
    .json(new ApiResponse(200, property, "Images deleted successfully"));
});

const deletePropertyVideos = asyncHandler(async (req, res) => {
  //1. Get the array containing urls to delete from req.body
  //2. Check if array is empty
  //3. Find the property by Id
  //4. Check if property exists or not
  //5. Check if videos array database has atleast 1 video
  //6. Filter the recieved urls from database
  //7. Save
  //8. Return response

  //1.
  const { receivedUrlArray } = req.body;

  //2.
  if (!receivedUrlArray || !receivedUrlArray.length) {
    throw new ApiError(404, "Please provide videos to delete");
  }

  //3.
  const property = await Property.findById(req.params.id);

  //4.
  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  //5.
  if (property?.videos.length === 0) {
    console.log("first", property?.videos.length, receivedUrlArray.length);
    throw new ApiError(404, "Property does not have any video");
  }

  //6.
  const originalLength = property.videos.length;

  await Promise.all(
    receivedUrlArray.map(async (oldUrl) => {
      await deleteOldVideoFileInCloudinary(oldUrl);
    })
  );

  property.videos = property.videos.filter(
    (video) => !receivedUrlArray.includes(video)
  );

  const removedCount = originalLength - property.videos.length;

  if (removedCount > 0) {
    //7.
    property.save();
  } else {
    throw new ApiError(400, "Please provide valid videos");
  }

  //8.
  return res
    .status(200)
    .json(new ApiResponse(200, property, "Videos deleted successfully"));
});

const getWhoVisitedPropertyPage = asyncHandler(async (req, res) => {
  const property = await Property.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "views",
        foreignField: "_id",
        as: "viewersInfo",
      },
    },
    {
      $project: {
        viewersInfo: {
          name: 1,
          email: 1,
          phone: 1,
        },
      },
    },
  ]);

  if (!property) {
    throw new ApiError(404, "No viewers found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        property[0].viewersInfo,
        "Visitors fetched successfully"
      )
    );
});

const getTotalViews = asyncHandler(async (req, res) => {
  //1. Find the propert by id
  //2. Check if property exists
  //3. return reponse and length of views

  //1.
  const property = await Property.findById(req.params.id);

  //2.
  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  //3.
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        property?.views.length,
        "Total no of views Fetched successfully"
      )
    );
});

export {
  healthCheck,
  createProperty,
  deleteProperty,
  getMyProperties,
  getSingleProperty,
  getAllProperties,
  updateproperty,
  updatePropertyImages,
  updatePropertyVideos,
  deletePropertyImages,
  deletePropertyVideos,
  getWhoVisitedPropertyPage,
  getTotalViews,
};

import { Property } from "../models/Property.model.js";
import { Review } from "../models/Review.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addReview = asyncHandler(async (req, res) => {
  //1. Destructure the property id from params
  //2. Get Review Content from body
  //3. Search the property
  //4. Check if property exists
  //5. Create DB
  //6. Return response

  //1.

  //3.
  if (req.body.review.trim() === "") {
    throw new ApiError(400, "Please add something in the review");
  }

  const property = await Property.findById(req.params.id);

  //4.
  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  const conditions = { property: req.params.id, reviewBy: req.user._id };

  let review = await Review.findOne(conditions);

  if (review) {
    review.content = req.body.review;
    review.save();

    return res
      .status(200)
      .json(new ApiResponse(200, review, "Review Updated successfully"));
  } else {
    //5.
    review = await Review.create({
      content: req.body.review,
      property: req.params.id,
      reviewBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, review, "Review added successfully"));
  }
});

const deleteMyReview = asyncHandler(async (req, res) => {
  //1. Check if the property exists or not
  //2. Find the review
  //3. Delete the review
  //4. Send the response

  //1.
  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  //2.
  const conditions = { property: req.params.id, reviewBy: req.user._id };

  const review = await Review.findOne(conditions);

  if (review) {
    await Review.findByIdAndDelete(review._id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Review Deleted Succesfully"));
  } else {
    throw new ApiError(404, "Review not found");
  }
});

const deleteSingleReview = asyncHandler(async (req, res) => {
  //1. User will pass the review id
  //2. Check if the review exists or not
  //3. Check if the user is the owner of the property
  //4. Delete the review

  //2.
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  //3.
  const property = await Property.findById(review.property);
  if (!property) {
    throw new ApiError(404, "Property does not exists");
  }

  if (!property.owner.equals(req.user._id)) {
    throw new ApiError(401, "You are not authorized to access this resource");
  }

  //4.
  await Review.findByIdAndDelete(req.params.id);

  return res.status(200).json(new ApiResponse(200, {}, "Review Deleted"));
});

const getAllReviews = asyncHandler(async (req, res) => {
  //1. Check if the property exists
  //2. Find all the Reviews for that property
  //3. Return a response

  //1.
  const { page = 1, limit = 4, sortBy = 'createdAt',  } = req.query;

  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  //2.

  const sortOptions ={}
  if(sortBy){
    sortOptions[sortBy] = -1
  }

  const reviews = await Review.aggregatePaginate(
    Review.aggregate([{$sort: sortOptions},{$skip:(page-1)*limit},{$limit: parseInt(limit)}])
  )


  //3.
  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "Reviews Fetched Successfully"));
});

export { addReview, deleteMyReview, deleteSingleReview, getAllReviews };

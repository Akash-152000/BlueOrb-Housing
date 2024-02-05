import { Like } from "../models/Like.model.js";
import { Property } from "../models/Property.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const togglePropertyLike = asyncHandler(async (req, res) => {
  //1. Get property Id from params
  //2. Get user id from middleware
  //3. Check if property exists
  //4. Check the db if already liked or not
  //5. Return response

  //1.
  const { propertyId } = req.params;


  //3.
  const property = await Property.findById(propertyId);

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  //4.
  

  const conditions = { likedBy: req.user._id, property: propertyId };

  const alreadyLiked = await Like.findOne(conditions);

  if (alreadyLiked) {
    const removeLike = await Like.findOneAndDelete(conditions);

    return res
      .status(200)
      .json(new ApiResponse(200, removeLike, "Like removed successfully"));
  } else {
    const addLike = await Like.create({ property: propertyId, likedBy: req.user._id });

    return res
      .status(200)
      .json(new ApiResponse(200, addLike, "Like added successfully"));
  }
});

const getLikedProperties = asyncHandler(async(req, res)=>{
    const likedProperties = await Like.find({likedBy:req.user._id})

    if(!likedProperties){
        throw new ApiError(404,"No properties liked")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,likedProperties,"Liked Properties Fetched Successfully"))
})

export { togglePropertyLike, getLikedProperties };

import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteOldImageFileInCloudinary,
  deleteOldVideoFileInCloudinary,
  uploadImageOnCloudinary,
} from "../utils/Cloudinary.js";
import { options } from "../constant.js";
import jwt from "jsonwebtoken";

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // 1. destructure data from body
  // 2. check if data is not empty
  // 3. check if user already exists
  // 4. check for images
  // 5. upload images on cloudinary
  // 6. Create entry in db
  // 7. remove password and refersh token from response
  // 8. Check for user creation
  // 9. return response

  // 1.
  const { name, phone, email, password, role } = req.body;

  // 2.
  if (
    [name, phone, email, password, role].some((item) => item?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  //3.
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User with same email exists");
  }

  //4.
  const localPath = req.file?.path;

  if (!localPath) {
    throw new ApiError(400, "Profile image is required");
  }

  //5.
  const profileImage = await uploadImageOnCloudinary(localPath);

  if (!profileImage) {
    throw new ApiError(400, "Profile Image is required");
  }

  //6.
  const user = await User.create({
    name,
    profileImage,
    phone,
    email,
    password,
    role,
  });


  const { accessToken, refreshToken } = await generateTokens(user._id);
  //7.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //8.
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  //9.
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, createdUser, "User Registered Succesfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //1. Destructure credentials from req.body
  //2. Check If user with email exists
  //3. match the password
  //4. Generate tokens
  //5. set tokens in cookies
  //6. return response

  //1.
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and Password both are required");
  }

  //2.
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "User does not exists");
  }

  //3.
  const checkPassword = await user.isPasswordCorrect(password);

  if (!checkPassword) {
    throw new ApiError(404, "Invalid Credentials");
  }

  //4.
  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -token");

  //5. 6.
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //1. Get userdetails from Middleware
  //2. Check if user data is provided by req.user
  //3. unset refreshToken in database
  //4. clear the cookies
  //5. return response

  //1.
  const user = req.user;

  //2.
  if (!user) {
    throw new ApiError(404, "Please login");
  }

  //3.
  await User.findByIdAndUpdate(user._id, {
    $unset: { refreshToken: 1 },
  });

  //4. 5.
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //1. Get refresh token from cookies
  //2. check if refreshToken exists
  //3. Decode the token and get the id
  //4. Search the database and match the tokens
  //5. regenerate new tokens
  //6. set the cookies and return
  try {
    //1.
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    //2.
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Access");
    }

    //3. 4.
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid Token or Token has been used");
    }

    //5.
    const { accessToken, refreshToken } = await generateTokens(user._id);

    //6.
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid Refresh Token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  //1. Destructure old password and new password from req.body
  //2. Check if both the fields are provided
  //3. Verify the old password
  //4. update the new password
  //4. return the response

  //1.
  const { oldPassword, newPassword } = req.body;

  //2.
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both the fields are required");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "Both the passwords are same");
  }

  //3.
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized access");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect old password");
  }

  //5.
  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  //6.
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User data fetched successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  //1. Destructure all the data from req.body
  //2. Check that atleast one field is provided
  //3. Update the database
  //4. Return the response

  //1.
  const { name, phone, email } = req.body;

  //   if (
  //     (name !== undefined && name?.trim() !== "") ||
  //     (phone !== undefined && phone?.trim() !== "") ||
  //     (email !== undefined && email?.trim() !== "")
  //   ) {

  const providedDataArray = [name, phone, email];

  if (
    !providedDataArray.some((item) => item !== undefined && item?.trim() !== "")
  ) {
    throw new ApiError(400, "At least one field is required");
  }

  const updateObject = {};

  if (name !== undefined && name.trim() !== "") {
    updateObject.name = name;
  }
  if (phone !== undefined && phone.trim() !== "") {
    updateObject.phone = phone;
  }
  if (email !== undefined && email.trim() !== "") {
    updateObject.email = email;
  }
  //3.
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateObject,
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Updated Successfully"));
  //   } else {
  //     throw new ApiError(400, "At least provide one non-empty field");
  //   }
});

const updateProfileImage = asyncHandler(async (req, res) => {
  //1. Destructure the localfilepath from middleware
  //2. Check if the file exists or not
  //3. Upload on cloudinary
  //4. Check if cloudinary function returned the url
  //5. Update the database
  //6. Delete the old url from cloudinary
  //7. Return the response

  //1.
  const localfilepath = req.file?.path;

  //2.
  if (!localfilepath) {
    throw new ApiError(400, "Please provide the file");
  }

  //3.
  const cloudinaryUrl = await uploadImageOnCloudinary(localfilepath);

  //4.
  if (!cloudinaryUrl) {
    throw new ApiError(
      500,
      "Something went wrong while uploading on cloudinary"
    );
  }

  //5.
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        profileImage: cloudinaryUrl,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  //6.
  const oldUrl = req.user.profileImage;
  try {
    const isOldImageDelete = await deleteOldImageFileInCloudinary(oldUrl);
  } catch (error) {
    console.log("error - ", error);
  }

  //7.
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile image updated succesfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserDetails,
  updateProfileImage,
};

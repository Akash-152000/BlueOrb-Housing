import { Notification } from "../models/Notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getNotifications = asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .sort({ createdAt: -1 })
      .populate("sender", "name");
    if (!notifications) {
      throw new ApiError(404, "No notifications");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          notifications,
          "Notifications fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user._id },
      { $set: { read: true } }
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Notifications marked as read successfully"
        )
      );
  } catch (error) {
    console.error("Error marking notifications as read:", error.message);
  }
});

export { getNotifications, markNotificationAsRead };

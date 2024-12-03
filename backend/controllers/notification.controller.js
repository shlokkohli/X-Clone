import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Notification } from '../models/notification.model.js';

const getNotifications = asyncHandler (async (req, res) => {

    const userId = req.user._id;

    const notifications = await Notification.find({ receiver: userId }).sort({ createdAt: -1 }).populate({
        "path": "sender",
        select: "username profileImg"
    })

    // mark notifications as read
    await Notification.updateMany({ receiver: userId }, { isRead: true });

    return res
    .status(200)
    .json(
        new ApiResponse(200, notifications, "Notifications fetched and marked as read")
    )

})

const deleteNotifications = asyncHandler (async (req, res) => {

    const userId = req.user._id;

    // delete all the notifications
    await Notification.deleteMany({ receiver: userId });

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Notifications deleted successfully")
    )

})

const deleteOne = asyncHandler (async (req, res) => {

    // get that notification's ID that we want to delete
    const { id } = req.params;

    // get the userId whose notification we want to delete
    const userId = req.user._id;

    // find the notification that matches the notification ID to the user
    const deletedNotification = await Notification.findOneAndDelete({
        _id: id,
        receiver: userId
    })

    if(!deletedNotification){
        throw new ApiError(404, "Notification not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {deletedNotification}, "Notification deleted successfully")
    )


})

export { getNotifications, deleteNotifications, deleteOne };
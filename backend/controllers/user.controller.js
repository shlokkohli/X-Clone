import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Notification } from '../models/notification.model.js'
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';

const getUserProfile = asyncHandler(async (req, res) => {

    const {username} = req.params;

    if(!username){
        throw new ApiError(400, "Username is required");
    }

    const user = await User.findOne({username}).select("-password -refreshToken");

    if(!user){
        throw new ApiError(404, "User not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User profile fetched successfully")
    )

})

const followUnfollowUser = asyncHandler(async (req, res) => {
    
    const { id } = req.params;               // the ID of the user to be followed or unfollowed
    const currentUserId = req.user._id;      // the ID of the currently logged in user

    if(!id){
        throw new ApiError(400, "User ID is required")
    }

    // Ensure that the user is not trying to follow or unfollow themselves
    if(id === currentUserId.toString()){
        throw new ApiError(400, "You cannot follow or unfollow yourself");
    }

    // Find the user to follow or unfollow
    const targetUser = await User.findById(id);
    if(!targetUser){
        throw new ApiError(400, "User not found");
    }

    const currentUser = await User.findById(currentUserId);

    // Check if the logged-in user is already following the target user
    const isFollowing = currentUser.following.includes(id);

    if(isFollowing){ // unfollow the user

        // remove the target user from the current user's following list
        currentUser.following = currentUser.following.filter((eachVal) => eachVal.toString() !== id);

        // remove the current user from the target user's followers
        targetUser.followers = targetUser.followers.filter((eachVal) => eachVal.toString() !== currentUserId.toString());

    }
    else { // follow the user

        // add the target user to the current user's following
        currentUser.following.push(id);

        // add the current user to the target user's followers
        targetUser.followers.push(currentUserId);

        // create a notification when followed
        await Notification.create({
            receiver: targetUser._id,
            sender: currentUser._id,
            type: 'follow',
        })
    }

    // Save both user's updated information
    await currentUser.save();
    await targetUser.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, {}, isFollowing ? "User Unfollowed Successfully" : "User Followed Successfully"
        )
    )

})

const getSuggestedUser = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    // users that are followed by the current user
    const currentUser = await User.findById(userId).select("following");

    const users = await User.find({
        _id: { 
            $ne: userId, // Exclude the current user
            $nin: currentUser.following 
        }
    })
    .limit(4)
    .select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200, users, "Suggested users fetched sucessfully")
    )

})

const updateUserProfile = asyncHandler(async (req, res) => {

    const {fullname, email, username, currentPassword, newPassword, bio, link} = req.body;

    let {profileImg, coverImg} = req.body;

    const userId = req.user._id;

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
        throw new ApiError(400, "Please provide both current password and new password");
    }

    // comparing the currentpassword in the db
    if(currentPassword && newPassword){
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if(!isMatch){
            throw new ApiError(400, "Current password is incorrect");
        }

        if(newPassword.length < 6){
            throw new ApiError(400, "Password must be alteast 6 characters long")
        }

        user.password = await bcrypt.hash(newPassword, 10);
    }
    
    if(profileImg){
        if(user.profileImg){
            // remove that image from our cloudinary account
            await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
        }
            
        const uploadedRepsonse = await cloudinary.uploader.upload(profileImg)
        profileImg = uploadedRepsonse.secure_url
    }

    if(coverImg){
        if(user.coverImg){
            // remove that image from our cloudinary account
            await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
        }
        
        const uploadedReponse = await cloudinary.uploader.upload(coverImg);
        coverImg = uploadedRepsonse.secure_url
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
        
    await user.save();

    user.password = null;

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User created successfully"))

})

export { getUserProfile, followUnfollowUser, getSuggestedUser, updateUserProfile }
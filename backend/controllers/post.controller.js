import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Posts } from '../models/posts.model.js';
import { Notification } from '../models/notification.model.js';
import { v2 as cloudinary } from 'cloudinary';

const createPost = asyncHandler(async (req,res) => {

    const { text } = req.body;
    let { img } = req.body;

    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "User not found")
    }

    if(!text && !img){
        throw new ApiError(400, "Post must have text or image")
    }

    if(img){
        const uploadedResponse = await cloudinary.uploader.upload(img);
        img = uploadedResponse.secure_url;
    }

    const newPost = await Posts.create({
        user: userId,
        text,
        img
    })

    return res
    .status(200)
    .json(new ApiResponse(200, newPost, "Post created successfully"));

})

const deletePost = asyncHandler(async (req,res) => {

    const { id } = req.params;

    const post = await Posts.findById(id);

    if(!post){
        throw new ApiError(404, "Post not found");
    }

    // check if we are the owner of the post
    if(post.user.toString() !== req.user._id.toString()){
        throw new ApiError(401, "You are not authorized to delete this post")
    }

    // if post have an image, delete the image from cloudinary
    if(post.img){
        const imgId = post.img.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(imgId);
    }

    // now delete the post from mongodb
    await Posts.findByIdAndDelete(id);

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted successfully"));

})

const commentOnPost = asyncHandler(async (req,res) => {

    const postId = req.params.id;
    const userId = req.user._id.toString();
    const { text } = req.body;

    if(!text){
        throw new ApiError(400, "Text field is required");
    }

    // find that post where comment has to be made
    const post = await Posts.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }

    // create the new comment
    const newComment = {
        text: text,
        user: userId
    }

    post.comments.push(newComment);

    await post.save();

    return res.
    status(201).
    json(new ApiResponse(201, newComment, "Comment added successfully"));

})

const linkUnlikePost = asyncHandler(async (req,res) => {

    const userId = req.user._id.toString(); //user id of the person who is making the like
    const { id:postId } = req.params; // ID of the post where the like has to be made

    // get that post
    const post = await Posts.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }

    // get the user who liked / unliked the post
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    // check if the user has already liked the post
    const likedPost = post.likes.includes(userId);

    // if the user has liked the post, unlike it
    if(likedPost){
        post.likes = post.likes.filter((eachVal) => eachVal.toString() !== userId);

        // Remove the post from the user's liked posts
        user.likedPosts = user.likedPosts.filter((eachVal) => eachVal.toString() !== postId);

        // save the updated post and user
        await post.save();
        await user.save();

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Post unliked successfully"));
    }
    else {
        // it means that user needs to like that post
        post.likes.push(userId);

        // add the post to the user's liked post
        user.likedPosts.push(postId);

        // save the updated post
        await post.save();

        // if a post have been liked, send notification also
        const notification = await Notification.create({
            receiver: post.user,
            sender: userId,
            type: 'like',
            isRead: false
        })

        return res
        .status(200)
        .json(new ApiResponse(200, { notification }, "Post liked successfully"));
    }

})

const getAllPosts = asyncHandler(async (req,res) => {

    const posts = await Posts.find().sort( {createdAt: -1} ).populate({
        path: "user",
        select: "-password -refreshToken"
    })
    .populate({
        path: "comments.user",
        select: "-password -refreshToken"
    })

    if(posts.length == 0){
        throw new ApiError(404, "No posts found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {posts}, "Posts fetched successfully"));

})

const getLikedPosts = asyncHandler(async (req, res) => {

    const {id: userId} = req.params;

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    // find all the posts that user have liked
    const likedPosts = await Posts.find({ likes: userId})
    .populate({
        path: "user",
        select: "-password -refreshToken"
    })
    .populate({
        path: "comments",
        select: "-password -refreshToken"
    })

    return res
    .status(200)
    .json(new ApiResponse(200, {likedPosts}, "Liked posts fetched successfully"))

})

const getFollowingPosts = asyncHandler(async (req,res) => {

    // the currently authenticated user in which we are going at the following section, to see the posts made by the people the user follows
    const userId = req.user._id;
    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(404, "User not found");
    }

    // get the following of the user
    const following = user.following

    const followingPosts = await Posts.find({ user: { $in: following } })
    .sort({ createdAt: -1 })
    .populate({
        path: "user",
        select: "-password -refreshToken"
    })
    .populate({
        path: "comments.user",
        select: "-password refreshToken"
    });

    if(followingPosts.length == 0){
        throw new ApiError(404, "No posts from following");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {followingPosts}, "Following posts fetched successfully"));

})

const getUserPosts = asyncHandler(async (req,res) => {

    const { username } = req.params;

    const user = await User.findOne( {username} );
    if(!user){
        throw new ApiError(404, "User not found");
    }

    const posts = await Posts.find( {user: user._id} ).sort({ createdAt: -1 })
    .populate({
        path: "user",
        select: "-password -refreshToken"
    })
    .populate({
        path: "comments.user",
        select: "-password -refreshToken"
    })

    if (posts.length === 0) {
        return res
        .status(200)
        .json(new ApiResponse(200, { posts }, "No posts found for this user"));
    }

    return res
    .status(200)
    .json(new ApiResponse(200, { posts }, "All posts fetched successfully"));

})

export { createPost, deletePost, commentOnPost, linkUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts,getUserPosts };
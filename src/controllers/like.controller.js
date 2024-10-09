import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id; 


    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        // If the like exists, remove it (unlike)
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    }

    // If the like does not exist, create a new like
    const newLike = await Like.create({
        video: videoId,
        likedBy: userId,
    });

    res.status(201).json(new ApiResponse(201, newLike, "Like added successfully"));
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id; // Get the ID of the authenticated user

    // Check if the user has already liked the comment
    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        // If the like exists, remove it (unlike)
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    }

    // If the like does not exist, create a new like
    const newLike = await Like.create({
        comment: commentId,
        likedBy: userId,
    });

    res.status(201).json(new ApiResponse(201, newLike, "Like added successfully"));
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id; // Get the ID of the authenticated user

    // Check if the user has already liked the tweet
    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        // If the like exists, remove it (unlike)
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    }

    // If the like does not exist, create a new like
    const newLike = await Like.create({
        tweet: tweetId,
        likedBy: userId,
    });

    res.status(201).json(new ApiResponse(201, newLike, "Like added successfully"));
});


const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get the ID of the authenticated user

    // Fetch liked videos for the user
    const likedVideos = await Like.find({ likedBy: userId })
        .populate('video')
        .exec();

    // Check if likedVideos is empty
    if (!likedVideos.length) {
        return res.status(404).json(new ApiResponse(404, [], "No liked videos found"));
    }

    res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));
});

const getLikedTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Fetch liked tweets for the user
    const likedTweets = await Like.find({ likedBy: userId })
        .populate('tweet')
        .exec();

    // Check if likedTweets is empty
    if (!likedTweets.length) {
        return res.status(404).json(new ApiResponse(404, [], "No liked tweets found"));
    }

    res.status(200).json(new ApiResponse(200, likedTweets, "Liked tweets retrieved successfully"));
});



export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikedTweets
}
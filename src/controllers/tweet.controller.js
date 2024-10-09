import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    // Validate content
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    // Create a new tweet
    const tweet = await Tweet.create({
        content,
        owner: req.user._id, // Using the authenticated user's ID
    });

    // Respond with the created tweet
    res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"));
});


const getUserTweets = asyncHandler(async (req, res) => {
    // Get the user ID from the authenticated user
    const userId = req.user._id;

    // Fetch tweets for the user
    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

    // Check if the user has tweets
    if (!tweets || tweets.length === 0) {
        throw new ApiError(404, "No tweets found for this user");
    }

    // Respond with the user's tweets
    res.status(200).json(new ApiResponse(200, tweets, "User tweets retrieved successfully"));
});



const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    // Validate tweet ID
    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Check if content is provided
    if (!content) {
        throw new ApiError(400, "Content is required for updating the tweet");
    }

    // Find the tweet and update it
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content },
        { new: true, runValidators: true } // Options to return the updated tweet and validate the update
    );

    // Check if tweet was found and updated
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Respond with the updated tweet
    res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});


const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Validate tweet ID
    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Find the tweet and delete it
    const tweet = await Tweet.findByIdAndDelete(tweetId);

    // Check if the tweet was found and deleted
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Respond with a success message
    res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Check if the user has already liked the video
    const existingLike = await Like.findOne({ video: videoId, userActivity: userId, type: 'like' });

    if (existingLike) {
        // If the like exists, remove it (undo like)
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    }

    // Check if the user has disliked the video and remove the dislike if it exists
    const existingDislike = await Like.findOne({ video: videoId, userActivity: userId, type: 'dislike' });
    if (existingDislike) {
        await Like.deleteOne({ _id: existingDislike._id });
    }

    // Add the like
    const newLike = await Like.create({
        video: videoId,
        userActivity: userId,
        type: 'like',
    });

    res.status(201).json(new ApiResponse(201, newLike, "Like added successfully"));
});

const toggleVideoDislike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Check if the user has already disliked the video
    const existingDislike = await Like.findOne({ video: videoId, userActivity: userId, type: 'dislike' });

    if (existingDislike) {
        // If the dislike exists, remove it (undo dislike)
        await Like.deleteOne({ _id: existingDislike._id });
        return res.status(200).json(new ApiResponse(200, null, "Dislike removed successfully"));
    }

    // Check if the user has liked the video and remove the like if it exists
    const existingLike = await Like.findOne({ video: videoId, userActivity: userId, type: 'like' });
    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
    }

    // Add the dislike
    const newDislike = await Like.create({
        video: videoId,
        userActivity: userId,
        type: 'dislike',
    });

    res.status(201).json(new ApiResponse(201, newDislike, "Dislike added successfully"));
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ comment: commentId, userActivity: userId, type: 'like' });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    }

    const existingDislike = await Like.findOne({ comment: commentId, userActivity: userId, type: 'dislike' });
    if (existingDislike) {
        await Like.deleteOne({ _id: existingDislike._id });
    }

    const newLike = await Like.create({
        comment: commentId,
        userActivity: userId,
        type: 'like',
    });

    res.status(201).json(new ApiResponse(201, newLike, "Like added successfully"));
});

const toggleCommentDislike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const existingDislike = await Like.findOne({ comment: commentId, userActivity: userId, type: 'dislike' });

    if (existingDislike) {
        await Like.deleteOne({ _id: existingDislike._id });
        return res.status(200).json(new ApiResponse(200, null, "Dislike removed successfully"));
    }

    const existingLike = await Like.findOne({ comment: commentId, userActivity: userId, type: 'like' });
    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
    }

    const newDislike = await Like.create({
        comment: commentId,
        userActivity: userId,
        type: 'dislike',
    });

    res.status(201).json(new ApiResponse(201, newDislike, "Dislike added successfully"));
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ tweet: tweetId, userActivity: userId, type: 'like' });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    }

    const existingDislike = await Like.findOne({ tweet: tweetId, userActivity: userId, type: 'dislike' });
    if (existingDislike) {
        await Like.deleteOne({ _id: existingDislike._id });
    }

    const newLike = await Like.create({
        tweet: tweetId,
        userActivity: userId,
        type: 'like',
    });

    res.status(201).json(new ApiResponse(201, newLike, "Like added successfully"));
});

const toggleTweetDislike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    const existingDislike = await Like.findOne({ tweet: tweetId, userActivity: userId, type: 'dislike' });

    if (existingDislike) {
        await Like.deleteOne({ _id: existingDislike._id });
        return res.status(200).json(new ApiResponse(200, null, "Dislike removed successfully"));
    }

    const existingLike = await Like.findOne({ tweet: tweetId, userActivity: userId, type: 'like' });
    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
    }

    const newDislike = await Like.create({
        tweet: tweetId,
        userActivity: userId,
        type: 'dislike',
    });

    res.status(201).json(new ApiResponse(201, newDislike, "Dislike added successfully"));
});




const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get the ID of the authenticated user

    // Fetch liked videos for the user
    const likedVideos = await Like.find({ userActivity: userId, type: "like" })
        .populate('video')
        .exec();

    // Check if likedVideos is empty
    if (!likedVideos.length) {
        return res.status(404).json(new ApiResponse(404, [], "No liked videos found"));
    }

    res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));
});

const getDislikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get the ID of the authenticated user

    // Fetch disliked videos for the user
    const dislikedVideos = await Like.find({ userActivity: userId, type: "dislike" })
        .populate('video')
        .exec();

    // Check if dislikedVideos is empty
    if (!dislikedVideos.length) {
        return res.status(404).json(new ApiResponse(404, [], "No disliked videos found"));
    }

    res.status(200).json(new ApiResponse(200, dislikedVideos, "Disliked videos retrieved successfully"));
});

// gets the users ids who has liked to the particular video made by the logged in user
const getLikesOnVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params; // Get the video ID from the request parameters

    // Fetch users who liked the video
    const likes = await Like.find({ video: videoId, type: "like" })
        .populate('userActivity', 'username') // Adjust the populated field as needed
        .exec();

    // Check if likes are empty
    if (!likes.length) {
        return res.status(404).json(new ApiResponse(404, [], "No likes found for this video"));
    }

    res.status(200).json(new ApiResponse(200, likes, "Likes retrieved successfully"));
});

// gets the users ids who has disliked to the particular video made by the logged in user
const getDislikesOnVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params; // Get the video ID from the request parameters

    // Fetch users who disliked the video
    const dislikes = await Like.find({ video: videoId, type: "dislike" })
        .populate('userActivity', 'username') // Adjust the populated field as needed
        .exec();

    // Check if dislikes are empty
    if (!dislikes.length) {
        return res.status(404).json(new ApiResponse(404, [], "No dislikes found for this video"));
    }

    res.status(200).json(new ApiResponse(200, dislikes, "Dislikes retrieved successfully"));
});




const getLikedTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get the ID of the authenticated user

    // Fetch liked tweets for the user
    const likedTweets = await Like.find({ userActivity: userId, tweet: { $ne: null }, type: "like" })
        .populate('tweet') // Populate tweet details if needed
        .exec();

    // Check if likedTweets is empty
    if (!likedTweets.length) {
        return res.status(404).json(new ApiResponse(404, [], "No liked tweets found"));
    }

    res.status(200).json(new ApiResponse(200, likedTweets, "Liked tweets retrieved successfully"));
});

const getDislikedTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get the ID of the authenticated user

    // Fetch disliked tweets for the user
    const dislikedTweets = await Like.find({ userActivity: userId, tweet: { $ne: null }, type: "dislike" })
        .populate('tweet') // Populate tweet details if needed
        .exec();

    // Check if dislikedTweets is empty
    if (!dislikedTweets.length) {
        return res.status(404).json(new ApiResponse(404, [], "No disliked tweets found"));
    }

    res.status(200).json(new ApiResponse(200, dislikedTweets, "Disliked tweets retrieved successfully"));
});

// gets the users ids who has liked to the particular tweet made by logged in user
const getLikesOnTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params; // Get tweet ID from request parameters

    // Fetch user IDs who liked the specified tweet
    const likes = await Like.find({ tweet: tweetId, type: "like" })
        .populate('userActivity') // Populate user details who liked the tweet
        .exec();

    // Check if any likes exist
    if (!likes.length) {
        return res.status(404).json(new ApiResponse(404, [], "No likes found for this tweet"));
    }

    res.status(200).json(new ApiResponse(200, likes, "Likes on the tweet retrieved successfully"));
});

// gets the users ids who has disliked to the particular tweet made by logged in user
const getDislikesOnTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params; // Get tweet ID from request parameters

    // Fetch user IDs who disliked the specified tweet
    const dislikes = await Like.find({ tweet: tweetId, type: "dislike" })
        .populate('userActivity') // Populate user details who disliked the tweet
        .exec();

    // Check if any dislikes exist
    if (!dislikes.length) {
        return res.status(404).json(new ApiResponse(404, [], "No dislikes found for this tweet"));
    }

    res.status(200).json(new ApiResponse(200, dislikes, "Dislikes on the tweet retrieved successfully"));
});




const getLikedComments = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get the ID of the authenticated user

    // Fetch liked comments for the user
    const likedComments = await Like.find({ userActivity: userId, comment: { $ne: null }, type: "like" })
        .populate('comment') // Populate comment details
        .exec();

    // Check if likedComments is empty
    if (!likedComments.length) {
        return res.status(404).json(new ApiResponse(404, [], "No liked comments found"));
    }

    res.status(200).json(new ApiResponse(200, likedComments, "Liked comments retrieved successfully"));
});

const getDislikedComments = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get the ID of the authenticated user

    // Fetch disliked comments for the user
    const dislikedComments = await Like.find({ userActivity: userId, comment: { $ne: null }, type: "dislike" })
        .populate('comment') // Populate comment details
        .exec();

    // Check if dislikedComments is empty
    if (!dislikedComments.length) {
        return res.status(404).json(new ApiResponse(404, [], "No disliked comments found"));
    }

    res.status(200).json(new ApiResponse(200, dislikedComments, "Disliked comments retrieved successfully"));
});

// gets the users id who has liked the particular comment made by logged in user 
const getLikesOnComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params; // Get the comment ID from request parameters

    // Fetch likes on the specific comment
    const likesOnComment = await Like.find({ comment: commentId, type: "like" })
        .populate('userActivity') // Populate user details
        .exec();

    // Check if likesOnComment is empty
    if (!likesOnComment.length) {
        return res.status(404).json(new ApiResponse(404, [], "No likes found for this comment"));
    }

    res.status(200).json(new ApiResponse(200, likesOnComment, "Likes on comment retrieved successfully"));
});

// gets the users id who has disliked the particular comment made by logged in user 
const getDislikesOnComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params; // Get the comment ID from request parameters

    // Fetch dislikes on the specific comment
    const dislikesOnComment = await Like.find({ comment: commentId, type: "dislike" })
        .populate('userActivity') // Populate user details
        .exec();

    // Check if dislikesOnComment is empty
    if (!dislikesOnComment.length) {
        return res.status(404).json(new ApiResponse(404, [], "No dislikes found for this comment"));
    }

    res.status(200).json(new ApiResponse(200, dislikesOnComment, "Dislikes on comment retrieved successfully"));
});




export {
    toggleVideoLike,
    toggleVideoDislike,
    toggleCommentLike,
    toggleCommentDislike,
    toggleTweetLike,
    toggleTweetDislike,
    getLikedTweets,
    getDislikedTweets,
    getLikesOnTweet,
    getDislikesOnTweet,
    getLikedComments,
    getDislikedComments,
    getLikesOnComment,
    getDislikesOnComment,
    getLikedVideos,
    getDislikedVideos,
    getLikesOnVideo,
    getDislikesOnVideo
}
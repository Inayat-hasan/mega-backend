import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const comments = await Comment.find({ video: videoId });

    if (!comments || comments.length === 0) {
        return res.status(404).json(new ApiResponse(404, [], "No comments found for this video."));
    }
    return res.status(200).json(new ApiResponse(200, comments));
});


const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params; // Extract videoId from request parameters
    const { content } = req.body; // Extract comment content from request body

    // Ensure videoId is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Validate that the comment content is provided
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

    // Create a new comment
    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id, // Get the owner from the authenticated user
    });

    // Return the newly created comment
    return res.status(201).json(new ApiResponse(201, newComment, "Comment added successfully."));
});


const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params; // Extract commentId from request parameters
    const { content } = req.body; // Extract new comment content from request body

    // Ensure commentId is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Validate that the comment content is provided
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    console.log('Comment:', comment);

    // Check if the comment exists
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if the current user is the owner of the comment
    if (!comment.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    // Update the comment content
    comment.content = content;
    await comment.save();

    // Return the updated comment
    return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully."));
});


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params; // Extract commentId from request parameters

    // Ensure commentId is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Find the comment by ID
    const comment = await Comment.findById(commentId);

    // Check if the comment exists
    if (!comment) {
        return res.status(404).json(new ApiResponse(404, null, "Comment not found"));
    }

    // Check if the current user is the owner of the comment
    if (!comment.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    // Delete the comment
    await Comment.deleteOne({ _id: commentId });

    // Return success response
    return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully."));
});


export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}

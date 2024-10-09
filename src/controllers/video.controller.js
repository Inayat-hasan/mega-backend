import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import * as mm from 'music-metadata';
import fs from 'fs';
import moment from "moment";



// Controller for getting all videos
const getAllVideos = asyncHandler(async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      query,
      sortBy = "createdAt",
      sortType = "desc",
    } = req.query;
  
    const match = {};
    if (query) {
      match.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }
  
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
    };
  
    const videos = await Video.aggregatePaginate(
      Video.aggregate().match(match),
      options
    );
  
    if (!videos) {
      throw new ApiError(404, "No videos found");
    }

    // console.log(videos.docs);
  
    res.render('myContent', {
      user: req.user,
      title: 'My Content',
      showAside: true,
      showHeader: true,
      cookies: req.cookies,
      videos: videos.docs,
      moment: moment
    });
  } catch (error) {
    console.log('Error in getting videos:', error);
  }
});


// Controller for publishing a new video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;

  // Check if all required fields are present
  const missingFields = [];
  if (!title) missingFields.push('title');
  if (!description) missingFields.push('description');

  if (missingFields.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;



  if (!title || !description || !videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Title, description, video file, and thumbnail are required.");
  }


  const uploadedVideo = await uploadOnCloudinary(videoFileLocalPath);
  if (!uploadedVideo) {
    throw new ApiError(500, "Failed to upload video file.");
  }

  const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!uploadedThumbnail) {
    throw new ApiError(500, "Failed to upload thumbnail.");
  }  

  
  const newVideo = await Video.create({
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    title,
    description,
    duration,
    owner: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully!"));
});


// Controller for getting a video by its ID
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Validate the video ID
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID format.");
  }

  // Retrieve the video from the database
  const video = await Video.findById(videoId).populate(
    "owner",
    "username avatar"
  );

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  res.status(200).json(new ApiResponse(200, video));
});

// Controller for updating video details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, duration } = req.body;

  // Prepare the update data
  const updateData = { title, description, duration };

  // Handle thumbnail upload
  if (req.files && req.files.thumbnail) {
      const thumbnailResponse = await uploadOnCloudinary(req.files.thumbnail[0].path);
      if (thumbnailResponse) {
          updateData.thumbnail = thumbnailResponse.secure_url; // Use the new thumbnail URL
      }
  }

  // Update the video in the database
  const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, {
      new: true,
      runValidators: true,
  });

  // Return response
  res.status(200).json({ success: true, data: updatedVideo });
});


// Controller for deleting a video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Validate the video ID
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID format.");
  }

  // Find and delete the video by ID
  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    throw new ApiError(404, "Video not found.");
  }

  // Optionally: If you want to delete the video file from Cloudinary
  // If you store the public ID for the video in the database, you can do it like this:
  // await cloudinary.uploader.destroy(deletedVideo.videoFilePublicId);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully."));
});

// Controller for toggling the publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Validate the video ID
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID format.");
  }

  // Find the video by ID
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  // Toggle the publish status
  video.isPublished = !video.isPublished;

  // Save the updated video
  const updatedVideo = await video.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        "Video publish status updated successfully."
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

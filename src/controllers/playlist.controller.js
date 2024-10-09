import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Check if the playlist name already exists for the user
    const existingPlaylist = await Playlist.findOne({ name, owner: req.user._id });
    if (existingPlaylist) {
        throw new ApiError(400, "Playlist with this name already exists.");
    }

    // Create a new playlist
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
    });

    // Return the created playlist
    res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully."));
});


const getUserPlaylists = asyncHandler(async (req, res) => {
    const  userId  = req.user._id;

    // Check if the userId is a valid ObjectId
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID.");
    }

    // Fetch playlists for the user
    const playlists = await Playlist.find({ owner: userId });

    // Return the playlists
    res.status(200).json(new ApiResponse(200, playlists, "Playlists retrieved successfully."));
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Check if the playlistId is a valid ObjectId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID.");
    }

    // Fetch the playlist by ID
    const playlist = await Playlist.findById(playlistId).populate('videos');

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found.");
    }

    // Return the playlist
    res.status(200).json(new ApiResponse(200, playlist, "Playlist retrieved successfully."));
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Check if the playlistId and videoId are valid ObjectIds
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist ID or video ID.");
    }

    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);
    
    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found.");
    }

    // Check if the video is already in the playlist
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video is already in the playlist.");
    }

    // Add the video to the playlist's videos array
    playlist.videos.push(videoId);
    await playlist.save(); // Save the updated playlist

    // Return the updated playlist
    res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully."));
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Check if the playlistId and videoId are valid ObjectIds
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist ID or video ID.");
    }

    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found.");
    }

    // Check if the video is in the playlist
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(404, "Video not found in the playlist.");
    }

    // Remove the video from the playlist's videos array
    playlist.videos = playlist.videos.filter(video => video.toString() !== videoId);
    await playlist.save(); // Save the updated playlist

    // Return a success response
    res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully."));
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Check if the playlistId is a valid ObjectId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID.");
    }

    // Find the playlist by ID and delete it
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found.");
    }

    // Return a success response
    res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully."));
});


const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    // Check if the playlistId is a valid ObjectId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID.");
    }

    // Find the playlist and update it with new details
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true, runValidators: true } // Return the updated document and validate
    );

    // Check if the playlist exists
    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found.");
    }

    // Return a success response with the updated playlist
    res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully."));
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
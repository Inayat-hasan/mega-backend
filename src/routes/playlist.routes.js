import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"; // Adjust the path as necessary
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Ensure the user is authenticated

const router = Router();

// Create a new playlist
router.route("/").post(verifyJWT, createPlaylist);


// Get all playlists for a user
router.route("/allplaylist").get(verifyJWT, getUserPlaylists);


// Get a specific playlist by ID
router.route("/playlist/:playlistId").get(verifyJWT, getPlaylistById);

// Add a video to a playlist
router.route("/playlist/:playlistId/video/:videoId").post(verifyJWT, addVideoToPlaylist);

// Remove a video from a playlist
router.route("/playlist/:playlistId/video/:videoId").delete(verifyJWT, removeVideoFromPlaylist);

// Delete a specific playlist
router.route("/playlist/:playlistId").delete(verifyJWT, deletePlaylist);

// Update a specific playlist
router.route("/playlist/:playlistId").patch(verifyJWT, updatePlaylist);

export default router;

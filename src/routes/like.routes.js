import express from "express";
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
  getLikedTweets,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Middleware to verify JWT
router.use(verifyJWT);

// Route to toggle like on a video
router.post("/video/:videoId", toggleVideoLike);

// Route to toggle like on a comment
router.post("/comment/:commentId", toggleCommentLike);

// Route to toggle like on a tweet
router.post("/tweet/:tweetId", toggleTweetLike);

// Route to get all liked videos
router.get("/videos", getLikedVideos);

// route to get all liked tweets
router.get("/tweets", getLikedTweets);

export default router;

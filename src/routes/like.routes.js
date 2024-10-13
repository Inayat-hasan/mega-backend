import express from "express";
import {
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
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { get } from "mongoose";

const router = express.Router();

// Middleware to verify JWT
router.use(verifyJWT);



// Routes related to videos
router.route("/likeVideo/:videoId").post(verifyJWT,toggleVideoLike);

router.route("/dislikeVideo/:videoId").post(verifyJWT,toggleVideoDislike);

router.route("/getLikedVideos").get(verifyJWT,getLikedVideos);

router.route("/getDislikedVideos").get(verifyJWT,getDislikedVideos);

router.route("/getLikesOnVideo/:videoId").get(verifyJWT,getLikesOnVideo);

router.route("/getDislikesOnVideo/:videoId").get(verifyJWT,getDislikesOnVideo);




// Routes related to comments
router.route("/likeComment/:commentId").post(verifyJWT,toggleCommentLike);

router.route("/dislikeComment/:commentId").post(verifyJWT,toggleCommentDislike);

router.route("/getLikedcomments").get(verifyJWT,getLikedComments);

router.route("/getDislikedcomments").get(verifyJWT,getDislikedComments);

router.route("/getLikesOnComment/:commentId").get(verifyJWT,getLikesOnComment);

router.route("/getDislikesOnComment/:commentId").get(verifyJWT,getDislikesOnComment);




// Routes related to tweets
router.route("/likeTweet/:tweetId").post(verifyJWT,toggleTweetLike);

router.route("/dislikeTweet/:tweetId").post(verifyJWT,toggleTweetDislike);

router.route("/getLikedTweets").get(verifyJWT,getLikedTweets);  

router.route("/getDislikedTweets").get(verifyJWT,getDislikedTweets);

router.route("/getLikesOnTweet/:tweetId").get(verifyJWT,getLikesOnTweet);

router.route("/getDislikesOnTweet/:tweetId").get(verifyJWT,getDislikesOnTweet);


export default router;

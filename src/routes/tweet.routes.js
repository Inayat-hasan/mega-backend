import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"; 
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js"; 

const router = Router();


router.post("/", verifyJWT, createTweet); 


router.get("/all", verifyJWT, getUserTweets); 


router.patch("/:tweetId", verifyJWT, updateTweet); 


router.delete("/:tweetId", verifyJWT, deleteTweet); 


export default router;

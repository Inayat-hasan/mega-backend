import { Router } from "express";
import { 
    toggleSubscription, 
    getUserChannelSubscribers, 
    getSubscribedChannels ,
    // made by codeium :
    getChannelSubscribers,
    getChannelSubscriptions,
    getUserSubscribers,
    getUserSubscriptions
} from "../controllers/subscription.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js"; 

const router = Router();


router.route("/:channelId").post(verifyJWT, toggleSubscription);


router.route("/:channelId/subscribers").get(verifyJWT, getUserChannelSubscribers);

router.route("/subscribed").get(verifyJWT, getSubscribedChannels);

// made by codeium :

router.route("/channel/:channelId/subscribers").get(verifyJWT, getChannelSubscribers);

router.route("/channel/:channelId/subscriptions").get(verifyJWT, getChannelSubscriptions);

router.route("/user/subscribers").get(verifyJWT, getUserSubscribers);

router.route("/user/subscriptions").get(verifyJWT, getUserSubscriptions);

export default router;

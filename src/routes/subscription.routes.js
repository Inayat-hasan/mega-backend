import { Router } from "express";
import { 
    toggleSubscription, 
    getUserChannelSubscribers, 
    getSubscribedChannels 
} from "../controllers/subscription.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js"; 

const router = Router();


router.route("/:channelId").post(verifyJWT, toggleSubscription);


router.route("/:channelId/subscribers").get(verifyJWT, getUserChannelSubscribers);


router.route("/subscribed").get(verifyJWT, getSubscribedChannels);


export default router;

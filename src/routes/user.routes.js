import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser,getUserVideos,getUserPlaylists, updateAccountDetails,getUserTweets, updateUserAvatar,getUserSubcribedTo } from "../controllers/User.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router.route("/avatar").patch(verifyJWT, upload.single("avatar") ,updateUserAvatar);

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage") ,changeCurrentPassword);

router.route('/c/:username').get(verifyJWT, getUserChannelProfile);

router.route('/history').get(verifyJWT, getWatchHistory);

router.route('/channel/videos').get(verifyJWT, getUserVideos);

router.route('/channel/playlists').get(verifyJWT, getUserPlaylists);

router.route('/channel/tweets').get(verifyJWT, getUserTweets);

router.route('/channel/subcribed').get(verifyJWT, getUserSubcribedTo);

export default router;

import { Router } from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();


router.route("/").get(getAllVideos); 


router.route("/:videoId").get(getVideoById); 


router.post("/publish", verifyJWT, upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]), publishAVideo
);
  

router.route("/:videoId").patch(
        verifyJWT,
        upload.single("thumbnail"), // Only allow thumbnail updates
        (req, res, next) => {
            if (req.fileValidationError) {
                return res.status(400).send(req.fileValidationError);
            }
            next();
        },
        updateVideo
);
 


router.route("/:videoId").delete(verifyJWT, deleteVideo); 



router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus); 


export default router;

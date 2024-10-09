import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Assuming you have authentication middleware

const router = Router();

// Route to get comments for a video
router.route("/:videoId/getcomments").get(getVideoComments);

// Route to add a comment to a video
router.route("/:videoId/comment").post(verifyJWT, addComment);

// Route to update a specific comment
router.route("/updatecomment/:commentId").patch(verifyJWT, updateComment);

// Route to delete a specific comment
router.route("/deletecomment/:commentId").delete(verifyJWT, deleteComment);

export default router;

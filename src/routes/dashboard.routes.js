import express from 'express';
import { getChannelStats, getChannelVideos } from '../controllers/dashboard.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/channel/:channelId/stats',verifyJWT, getChannelStats);


router.get('/channel/:channelId/videos',verifyJWT, getChannelVideos);

export default router;

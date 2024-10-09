import express from 'express';
import { healthcheck } from '../controllers/healthcheck.controller.js'; 
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router(); 


router.get('/healthcheck',verifyJWT, healthcheck);

export default router;

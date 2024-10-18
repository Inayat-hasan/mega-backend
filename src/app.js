import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path'
import { fileURLToPath } from 'url';
import expressLayouts from 'express-ejs-layouts'



const app = express()

app.use(expressLayouts);


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static("public"));

app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('views', path.join(__dirname, '../views'));

app.set("view engine","ejs");

app.set('layout', 'layouts/layout');




// routes 
import userRouter from './routes/user.routes.js';

import pagesRouter from './routes/pages.routes.js';

import videoRouter from './routes/video.routes.js';

import tweetRouter from './routes/tweet.routes.js';

import subscriptionRouter from './routes/subscription.routes.js';

import playlistRouter from "./routes/playlist.routes.js"; 

import commentRouter from './routes/comment.routes.js';

import likeRouter from './routes/like.routes.js';

import dashboardRoutes from './routes/dashboard.routes.js';

import healthcheckRoutes from './routes/healthcheck.routes.js';



// routes declaration
app.use('/',pagesRouter)

app.use("/api/v1/users",userRouter);

app.use("/api/v1/videos",videoRouter);

app.use("/api/v1/tweets",tweetRouter);

app.use("/api/v1/subscriptions", subscriptionRouter);

app.use("/api/v1/playlists", playlistRouter);

app.use("/api/v1", commentRouter);


app.use('/api/v1/likes', likeRouter);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api', healthcheckRoutes);



// https://localhost:8000/api/v1/users/register

export { app };
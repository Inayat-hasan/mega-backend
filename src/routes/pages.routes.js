import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos } from "../controllers/video.controller.js";
import { getUserPlaylists, getUserVideos } from "../controllers/User.controller.js";

const router = Router();

router.route("/").get((req, res) => {
    res.render('home',{
        cookies: req.cookies,
        title: 'Home',
        showHeader: true,
        showAside: true
    });
});

router.route("/signup").get((req, res) => {
    res.render('register',{
        title: 'Sign up',
        showAside: false,
        showHeader: false
    });
});

router.route("/login").get((req, res) => {
    res.render('login',{
        title: 'Login',
        showAside: false,
        showHeader: false
    });
});

router.route("/channel/videos").get(verifyJWT,getUserVideos);

router.route('/channel/playlists').get(verifyJWT,getUserPlaylists);

router.route("/videoDetail").get(verifyJWT,(req,res) => {
    res.render('videoDetail');
});

router.route("/channel/playlist/videos").get(verifyJWT,(req,res) => {
    res.render('playlistVideo');
});

router.route("/channel/tweets").get(verifyJWT,(req, res) => {
    res.render('channelTweets')
});

router.route("/channel/subscribers").get(verifyJWT,(req, res) => {
    res.render('channelSubscribers')
});

router.route("/channel/uploadvideo").get(verifyJWT,(req, res) => {
    res.render('uploadVideo');
});

router.route('/channel/uploadvideo/popup').get(verifyJWT,(req, res) => {
    res.render('videoPopup');
});

router.route('/channel/videoUploaded').get(verifyJWT,(req, res) => {
    res.render('finishVideoUpload');
});

router.route('/user/personalInfo').get(verifyJWT,(req, res) => {
    res.render('personalInfo');
});

router.route('/channelInfo').get(verifyJWT,(req, res) => {
    res.render('channelInfo');
});

router.route('/changePassword').get(verifyJWT,(req, res) => {
    res.render('changePassword');
});

router.route('/admin/dashboard').get(verifyJWT,(req, res) => {
    res.render('adminDashboard');
});

router.route('/editVideo').get(verifyJWT,(req, res) => {
    res.render('editVideoModal');
});

router.route('/deleteVideo').get(verifyJWT,(req, res) => {
    res.render('deleteVideoPopup');
});

router.route('/privacyPolicy').get((req, res) => {
    res.render('privacyPolicy');
});

router.route('/termsConditions').get((req, res) => {
    res.render('termsConditions');
});

export default router;
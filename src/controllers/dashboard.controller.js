import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Fetch total views from videos owned by the channel
    const totalViews = await Video.aggregate([
        { $match: { owner: channelId } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    // Count total subscribers to the channel
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // Count total likes from videos owned by the channel
    const totalLikes = await Like.countDocuments({ video: { $in: await Video.find({ owner: channelId }).distinct('_id') } });

    return res.status(200).json({
        success: true,
        data: {
            totalViews: totalViews[0]?.totalViews || 0,
            totalSubscribers,
            totalLikes
        }
    });
});


const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Fetch videos owned by the channel
    const videos = await Video.find({ owner: channelId })
        .select('thumbnail title isPublished createdAt')
        .lean();

    // Format videos with additional details
    const formattedVideos = await Promise.all(videos.map(async (video) => {
        const likesCount = await Like.countDocuments({ video: video._id });
        const dislikesCount = 0; // Assuming you have a way to calculate dislikes

        return {
            thumbnail: video.thumbnail,
            title: video.title,
            status: video.isPublished ? 'Published' : 'Unpublished',
            uploadedDate: video.createdAt,
            likes: likesCount,
            dislikes: dislikesCount // Assuming this is fetched from a different source
        };
    }));

    return res.status(200).json({
        success: true,
        data: formattedVideos
    });
});




export {
    getChannelStats, 
    getChannelVideos
}
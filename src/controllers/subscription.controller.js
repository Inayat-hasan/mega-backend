import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params; // From route params
    const userId = req.user._id; // Get user ID from JWT token

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({ channel: channelId, subscriber: userId });
    if (existingSubscription) {
        await Subscription.deleteOne({ channel: channelId, subscriber: userId });
        return res.json(new ApiResponse(200,null,"Unsubscribed"));
    }

    // Subscribe
    const newSubscription = new Subscription({ channel: channelId, subscriber: userId });
    await newSubscription.save();
    res.json(new ApiResponse(201,null,"Subscribed"));
});




// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate the channel ID
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID.");
    }

    // Find subscribers for the specified channel
    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "username fullName avatar");


    // console.log("Subscribers Raw Data: ", subscribers);

    // If no subscribers found, return an empty array
    if (!subscribers.length) {
        return res.json(new ApiResponse(200,null, "NO SUBSCRIBERS found!"));
    }

    const subscriberDetails = subscribers.map(sub => {
        if (sub.subscriber) {
            return {
                id: sub.subscriber._id, 
                username: sub.subscriber.username,
                fullName: sub.subscriber.fullName,
                avatar: sub.subscriber.avatar,
            };
        } else {
            return {
                id: sub.subscriber, 
                username: null,
                fullName: null,
                avatar: null,
            };
        }
    });
    

    // Return the subscriber list
    return res.json(new ApiResponse(200,subscriberDetails,"SUBSCRIBERS found!"));
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get the authenticated user's ID from JWT

    // Validate the subscriber ID
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid subscriber ID.");
    }

    // Find subscriptions for the specified subscriber
    const subscriptions = await Subscription.find({ subscriber: userId }).populate("channel", "username fullName avatar"); 

    // If no subscriptions found, return an empty array
    if (subscriptions.length <= 0) {
        return res.status(200).json({ success: true, data: [] });
    }

    // Map through subscriptions to return an array of channel details
    const subscribedChannels = subscriptions.map(sub => ({
        id: sub.channel._id,
        username: sub.channel.username,
        fullName: sub.channel.fullName,
        avatar: sub.channel.avatar,
    }));

    // Return the subscribed channel list
    return res.status(200).json({ success: true, data: subscribedChannels });
});



// made by codeium : 

const getChannelSubscribers = asyncHandler(async (req, res) => {
    const channelId = req.params.channelId;
  
    try {
      // Validate the channel ID
      if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID.");
      }
  
      // Find subscriptions where the channel is the provided channel ID
      const subscriptions = await Subscription.find({ channel: channelId }).populate("subscriber", "username fullName avatar");
  
      // If no subscribers found, return an empty array
      if (!subscriptions.length) {
        return res.status(200).json(new ApiResponse(200, { success: true, data: [] }));
      }
  
      const subscriberDetails = subscriptions.map(sub => {
        if (sub.subscriber) {
          return {
            id: sub.subscriber._id,
            username: sub.subscriber.username,
            fullName: sub.subscriber.fullName,
            avatar: sub.subscriber.avatar,
          };
        } else {
          return {
            id: sub.subscriber,
            username: null,
            fullName: null,
            avatar: null,
          };
        }
      });
  
      // Return the subscriber list
      return res.status(200).json(new ApiResponse(200, { success: true, data: subscriberDetails }));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
});  

const getChannelSubscriptions = asyncHandler(async (req, res) => {
    const channelId = req.params.channelId;
  
    try {
      // Validate the channel ID
      if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID.");
      }
  
      // Find subscriptions where the channel is the provided channel ID
      const subscriptions = await Subscription.find({ channel: channelId }).populate("subscriber", "username fullName avatar");
  
      // If no subscribers found, return an empty array
      if (!subscriptions.length) {
        return res.status(200).json(new ApiResponse(200, { success: true, data: [] }));
      }
  
      const subscriberDetails = subscriptions.map(sub => {
        if (sub.subscriber) {
          return {
            id: sub.subscriber._id,
            username: sub.subscriber.username,
            fullName: sub.subscriber.fullName,
            avatar: sub.subscriber.avatar,
          };
        } else {
          return {
            id: sub.subscriber,
            username: null,
            fullName: null,
            avatar: null,
          };
        }
      });
  
      // Return the subscriber list
      return res.status(200).json(new ApiResponse(200, { success: true, data: subscriberDetails }));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
});
  
const getUserSubscribers = asyncHandler(async (req, res) => {
    const userId = req.user._id;
  
    try {
      // Find subscriptions where the channel is the logged-in user's ID
      const subscriptions = await Subscription.find({ channel: userId }).populate("subscriber", "username fullName avatar");
  
      // If no subscribers found, return an empty array
      if (!subscriptions.length) {
        return res.status(200).json(new ApiResponse(200, { success: true, data: [] }));
      }
  
      const subscriberDetails = subscriptions.map(sub => {
        if (sub.subscriber) {
          return {
            id: sub.subscriber._id,
            username: sub.subscriber.username,
            fullName: sub.subscriber.fullName,
            avatar: sub.subscriber.avatar,
          };
        } else {
          return {
            id: sub.subscriber,
            username: null,
            fullName: null,
            avatar: null,
          };
        }
      });
  
      // Return the subscriber list
      return res.status(200).json(new ApiResponse(200, { success: true, data: subscriberDetails }));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
});
  
const getUserSubscriptions = asyncHandler(async (req, res) => {
    const userId = req.user._id;
  
    try {
      // Validate the user ID
      if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID.");
      }
  
      // Find subscriptions where the subscriber is the logged-in user
      const subscriptions = await Subscription.find({ subscriber: userId }).populate("channel", "username fullName avatar");
  
      // If no subscriptions found, return an empty array
      if (!subscriptions.length) {
        return res.status(200).json(new ApiResponse(200, { success: true, data: [] }));
      }
  
      const subscriptionDetails = subscriptions.map(sub => {
        if (sub.channel) {
          return {
            id: sub.channel._id,
            username: sub.channel.username,
            fullName: sub.channel.fullName,
            avatar: sub.channel.avatar,
          };
        } else {
          return {
            id: sub.channel,
            username: null,
            fullName: null,
            avatar: null,
          };
        }
      });
  
      // Return the subscription list
      return res.status(200).json(new ApiResponse(200, { success: true, data: subscriptionDetails }));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    // made by codeium :
    getChannelSubscribers,
    getChannelSubscriptions,
    getUserSubscribers,
    getUserSubscriptions
}
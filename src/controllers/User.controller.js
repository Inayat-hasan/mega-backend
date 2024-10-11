import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import ejs from 'ejs';
import moment from "moment";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {accessToken, refreshToken};


    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating refresh and access token');
    };
};

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists ; username , email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object -- create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return res


    const {fullName, email, username, password } = req.body;
    // console.log("email",email);

    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    });

    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    };

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if  (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    };

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    };

    return res.redirect('/');
});

const loginUser = asyncHandler(async (req,res) => {
    // req body > data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie 
    // send response of logged in

    const {username , email , password} = req.body;
    // console.log(req.body);
    
    if (!username && !email) {
        throw new ApiError(400, "username and email is required")
    };

    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required");
    // };

    const user = await User.findOne({
        $or: [{username}, {email}]
    });

    if (!user) {
        throw new ApiError(404,"user does not exist")
    };

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401,"invalid user credentials")
    };

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken,options)   
    .cookie("refreshToken", refreshToken,options) 
    .redirect('/');

});

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken ;

    console.log(incomingRefreshToken);

    if(!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorized request");
    };

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    
        const user = await User.findById(decodedToken?._id);
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        };
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        };
        
        const options = {
            httpOnly: true,
            secure: true
        };
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token");

    }

});

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body;

    // console.log(oldPassword, newPassword);

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old Password");
    };

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password Changed successfully!"))
    
});

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully!"))
});

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body;

    if(!fullName && !email) {
        throw new ApiError(400, "All fields are required");
    };

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        {new: true}
    ).select("-password");

    return res
    .status(200)
    .json(new ApiResponse(200,user, "Account details updated successfully"))
    
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    };

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url) {
        throw new ApiError(400, "Error while uploading an avatar");
    };

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar  updated successfully")
    )
});

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath) {
        throw new ApiError(400, "coverImage file is missing");
    };

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url) {
        throw new ApiError(400, "Error while uploading an cover image");
    };

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image updated successfully")
    )
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params;

    if(!username?.trim()) {
        throw new ApiError(400, "username is missing");
    };

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
              subscribersCount: {
                $size: {
                  $ifNull: ["$subscribers", []]
                }
              },
              subscribedToCount: {
                $size: {
                  $ifNull: ["$subscribedTo", []]
                }
              },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);

    // console.log(channel)

    if(!channel?.length) {
        throw new ApiError(404, "channel does not exist");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully!")
    )
});

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            },
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: "owner",
                            foreignField: "_id",
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch History fetched successfully"
        )
    )
});

const getUserVideos = asyncHandler(async (req, res) => {
    try {
      // const pipeline = [
      //   {
      //     $match: {
      //       _id: req.user._id,
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "videos",
      //       localField: "_id",
      //       foreignField: "owner",
      //       as: "videos",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "subscriptions",
      //       localField: "_id",
      //       foreignField: "channel",
      //       as: "subscribers",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "subscriptions",
      //       localField: "_id",
      //       foreignField: "subscriber",
      //       as: "subscribedTo",
      //     },
      //   },
      //   {
      //     $addFields: {
      //       subscribersCount: {
      //         $size: {
      //           $ifNull: ["$subscribers", []]
      //         }
      //       },
      //       subscribedToCount: {
      //         $size: {
      //           $ifNull: ["$subscribedTo", []]
      //         }
      //       },
      //         isSubscribed: {
      //             $cond: {
      //                 if: {$in: [req.user?._id, "$subscribers.subscriber"]},
      //                 then: true,
      //                 else: false
      //             }
      //         }
      //     }
      //   },
      //   {
      //     $project: {
      //       fullName: 1,
      //       username: 1,
      //       avatar: 1,
      //       coverImage: 1,
      //       email: 1,
      //       videos: {
      //         $map: {
      //           input: "$videos",
      //           as: "video",
      //           in: {
      //             _id: "$$video._id",
      //             videoFile: "$$video.videoFile",
      //             thumbnail: "$$video.thumbnail",
      //             title: "$$video.title",
      //             description: "$$video.description",
      //             duration: "$$video.duration",
      //             views: "$$video.views",
      //             isPublished: "$$video.isPublished",
      //             createdAt: "$$video.createdAt",
      //           },
      //         },
      //       },
      //       subscribersCount: 1,
      //       subscribedToCount: 1,
      //       isSubscribed: 1
      //     },
      //   },
      //   {
      //     $sort: {
      //       "videos.createdAt": -1,
      //     },
      //   }
      // ];


      if (!req.user) {
        return res.status(401).json(new ApiError(401, "Unauthorized request"));
      }
      
      const channel = await User.aggregate([
        {
          $match: {
            _id: req.user._id,
          },
        },
        {
          $lookup: {
            from: "videos",
            localField: "_id",
            foreignField: "owner",
            as: "videos",
          },
        },
        {
          $sort: {
            "videos.createdAt": -1,
          },
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers",
          },
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo",
          },
        },
        {
          $addFields: {
            subscribersCount: {
              $size: {
                $ifNull: ["$subscribers", []]
              }
            },
            subscribedToCount: {
              $size: {
                $ifNull: ["$subscribedTo", []]
              }
            },
              isSubscribed: {
                  $cond: {
                      if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                      then: true,
                      else: false
                  }
              }
          }
        },
        {
          $project: {
            fullName: 1,
            username: 1,
            avatar: 1,
            coverImage: 1,
            email: 1,
            videos: {
              $map: {
                input: "$videos",
                as: "video",
                in: {
                  _id: "$$video._id",
                  videoFile: "$$video.videoFile",
                  thumbnail: "$$video.thumbnail",
                  title: "$$video.title",
                  description: "$$video.description",
                  duration: "$$video.duration",
                  views: "$$video.views",
                  isPublished: "$$video.isPublished",
                  createdAt: "$$video.createdAt",
                },
              },
            },
            subscribersCount: 1,
            subscribedToCount: 1,
            isSubscribed: 1
          },
        }
      ]);
      // console.log(channel[0].videos);
    
      return res.render('channelVideo', {
        user: req.user,
        title: 'My channel videos',
        showAside: true,
        showHeader: true,
        cookies: req.cookies,
        videos: channel[0].videos,
        moment: moment,
        subscribers: channel[0].subscribersCount,
        subscribed : channel[0].subscribedToCount,
        isSubscribed: channel[0].isSubscribed
      });
  
      // return res.status(200).json(
      //   new ApiResponse(200,channel[0], "videos fetched successfully")
      // );
  
  
    } catch (error) {
      res.json(new ApiError(500, error.message));
    }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json(new ApiError(401, "Unauthorized request"));
    }

    // const pipeline = [
    //   {
    //     $match: { _id: req.user._id },
    //   },
    //   {
    //     $lookup: {
    //       from: "playlists",
    //       localField: "_id",
    //       foreignField: "owner",
    //       as: "playlists",
    //     },
    //   },
    //   {
    //     $sort: {
    //       "playlists.createdAt": -1,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "subscriptions",
    //       localField: "_id",
    //       foreignField: "channel",
    //       as: "subscribers",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "subscriptions",
    //       localField: "_id",
    //       foreignField: "subscriber",
    //       as: "subscribedTo",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       subscribersCount: {
    //         $size: {
    //           $ifNull: ["$subscribers", []]
    //         }
    //       },
    //       subscribedToCount: {
    //         $size: {
    //           $ifNull: ["$subscribedTo", []]
    //         }
    //       },
    //         isSubscribed: {
    //             $cond: {
    //                 if: {$in: [req.user?._id, "$subscribers.subscriber"]},
    //                 then: true,
    //                 else: false
    //             }
    //         }
    //     }
    //   },
    //   {
    //     $project: {
    //       fullName: 1,
    //       username: 1,
    //       avatar: 1,
    //       coverImage: 1,
    //       email: 1,
    //       playlists: {
    //         $map: {
    //           input: "$playlists",
    //           as: "playlist",
    //           in: {
    //             _id: "$$playlist._id",
    //             name: "$$playlist.name",
    //             description: "$$playlist.description",
    //             videos: "$$playlist.videos",
    //             createdAt: "$$playlist.createdAt",
    //           },
    //         },
    //       },
    //       subscribersCount: 1,
    //       subscribedToCount: 1,
    //       isSubscribed: 1
    //     },
    //   }
    // ];
  
    
    const channel = await User.aggregate([
      {
        $match: { _id: req.user._id },
      },
      {
        $lookup: {
          from: "playlists",
          localField: "_id",
          foreignField: "owner",
          as: "playlists",
        },
      },
      {
        $sort: {
          "playlists.createdAt": -1,
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: {
              $ifNull: ["$subscribers", []]
            }
          },
          subscribedToCount: {
            $size: {
              $ifNull: ["$subscribedTo", []]
            }
          },
            isSubscribed: {
                $cond: {
                    if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                    then: true,
                    else: false
                }
            }
        }
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
          playlists: {
            $map: {
              input: "$playlists",
              as: "playlist",
              in: {
                _id: "$$playlist._id",
                name: "$$playlist.name",
                description: "$$playlist.description",
                videos: "$$playlist.videos",
                createdAt: "$$playlist.createdAt",
                updatedAt: "$$playlist.updatedAt",
              },
            },
          },
          subscribersCount: 1,
          subscribedToCount: 1,
          isSubscribed: 1
        },
      }
    ]);

    return res.render('channelPlaylist', {
      cookies: req.cookies,
      title: 'My Channel Playlists',
      showHeader: true,
      showAside: true,
      user: req.user,
      playlists: channel[0].playlists,
      moment: moment,
      subscribers: channel[0].subscribersCount,
      subscribed : channel[0].subscribedToCount,
      isSubscribed: channel[0].isSubscribed
    });
  
    // return res.status(200).json(
    //   new ApiResponse(200,channel[0], "playlist fetched successfully")
    // );
});

const getUserTweets = asyncHandler(async (req, res) => {
    if (!req.user) {
    return res.status(401).json(new ApiError(401, "Unauthorized request"));
    }

    // const pipeline = [
    //   {
    //     $match: { _id: req.user._id },
    //   },
    //   {
    //     $lookup: {
    //       from: "tweets",
    //       localField: "_id",
    //       foreignField: "owner",
    //       as: "tweets",
    //     },
    //   },
    //   {
    //     $sort: {
    //       "tweets.createdAt": -1,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "subscriptions",
    //       localField: "_id",
    //       foreignField: "channel",
    //       as: "subscribers",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "subscriptions",
    //       localField: "_id",
    //       foreignField: "subscriber",
    //       as: "subscribedTo",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       subscribersCount: {
    //         $size: {
    //           $ifNull: ["$subscribers", []]
    //         }
    //       },
    //       subscribedToCount: {
    //         $size: {
    //           $ifNull: ["$subscribedTo", []]
    //         }
    //       },
    //         isSubscribed: {
    //             $cond: {
    //                 if: {$in: [req.user?._id, "$subscribers.subscriber"]},
    //                 then: true,
    //                 else: false
    //             }
    //         }
    //     }
    //   },
    //   {
    //     $project: {
    //       fullName: 1,
    //       username: 1,
    //       avatar: 1,
    //       coverImage: 1,
    //       email: 1,
    //       tweets: {
    //         $map: {
    //           input: "$tweets",
    //           as: "tweet",
    //           in: {
    //             _id: "$$tweet._id",
    //             content: "$$tweet.content",
    //             createdAt: "$$tweet.createdAt",
    //           },
    //         },
    //       },
    //       subscribersCount: 1,
    //       subscribedToCount: 1,
    //       isSubscribed: 1
    //     },
    //   }
    // ];
  
    
  
    const channel = await User.aggregate([
      {
        $match: { _id: req.user._id },
      },
      {
        $lookup: {
          from: "tweets",
          localField: "_id",
          foreignField: "owner",
          as: "tweets",
        },
      },
      {
        $sort: {
          "tweets.createdAt": -1,
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: {
              $ifNull: ["$subscribers", []]
            }
          },
          subscribedToCount: {
            $size: {
              $ifNull: ["$subscribedTo", []]
            }
          },
            isSubscribed: {
                $cond: {
                    if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                    then: true,
                    else: false
                }
            }
        }
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
          tweets: {
            $map: {
              input: "$tweets",
              as: "tweet",
              in: {
                _id: "$$tweet._id",
                content: "$$tweet.content",
                createdAt: "$$tweet.createdAt",
              },
            },
          },
          subscribersCount: 1,
          subscribedToCount: 1,
          isSubscribed: 1
        },
      }
    ]);
  
    return res.status(200).json(new ApiResponse(200,channel[0], "tweets fetched successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    getUserVideos,
    getUserPlaylists,
    getUserTweets
};
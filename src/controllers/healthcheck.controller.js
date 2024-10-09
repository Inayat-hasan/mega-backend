import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    
    const serviceStatus = true; 


    if (!serviceStatus) {
        throw new ApiError(503, "Service is currently unavailable.");
    }

    
    return res.status(200).json(new ApiResponse(200, {
        status: 'OK',
        message: 'Service is up and running!',
    }));
    
});

export {
    healthcheck
};
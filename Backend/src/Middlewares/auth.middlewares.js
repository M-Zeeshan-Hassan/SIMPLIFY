// import jwt from 'jsonwebtoken';
// import {TeamMember} from '../Models/TeamMember.model.js';
// import { asyncHandler } from "../Utils/AsyncHandler.js";
// import { ApiError } from "../Utils/ApiError.js";
// import { ApiResponse } from "../Utils/ApiResponse.js";


// export const verifyToken = asyncHandler(async (req, res, next) => {
//     try {

//         const accessToken = req.cookies.accessToken;
//         console.log("Access Token:", accessToken);

//         if (!accessToken) {
//             return res.status(401).json(new ApiError(401, "Access Token is required"));
//         }

//        const decodedToken =  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
//         console.log(decodedToken);

//             const user = await TeamMember.findById(decodedToken._id).select("-password -refreshToken");
//             console.log(user);
//             if (!user) {
//                 return res.status(404).json(new ApiError(404, "User not found"));

//             }
//             req.user = user;
//             next();
//         }
//     catch (error) {
//         throw new Error(error.message);
//     }
// });

import jwt from 'jsonwebtoken';
import { TeamMember } from '../Models/TeamMember.model.js';
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;
        console.log("aacess",accessToken)

        if (!accessToken) {
            return res.status(401).json(new ApiError(401, "Access Token is required"));
        }

        try {
            // ✅ Try verifying access token
            const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

            const user = await TeamMember.findById(decodedToken._id).select("-password -refreshToken");
            if (!user) {
                return res.status(404).json(new ApiError(404, "User not found"));
            }

            req.user = user;
            console.log("user",user)
            return next();
        } catch (err) {
            // ❌ If access token expired → check refresh token
            // ❌ If access token expired → check refresh token
            if (err.name === "TokenExpiredError" && refreshToken) {
                try {
                    const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

                    const user = await TeamMember.findById(decodedRefresh._id);
                    if (!user || user.refreshToken !== refreshToken) {
                        return res
                            .clearCookie("accessToken", { httpOnly: true, secure: false })
                            .clearCookie("refreshToken", { httpOnly: true, secure: false })
                            .status(403)
                            .json(new ApiError(403, "Invalid refresh token, please login again"));
                    }

                    // 🔑 Generate new access token
                    const newAccessToken = user.generateAccessToken();

                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: false,
                        maxAge: 24 * 60 * 60 * 1000 // 1 day
                    });

                    req.user = user;
                    return next();
                } catch (refreshErr) {
                    return res
                        .clearCookie("accessToken", { httpOnly: true, secure: false })
                        .clearCookie("refreshToken", { httpOnly: true, secure: false })
                        .status(403)
                        .json(new ApiError(403, "Refresh token expired, please login again"));
                }
            }

            return res.status(401).json(new ApiError(401, "Invalid or expired token"));
        }
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message));
    }
});





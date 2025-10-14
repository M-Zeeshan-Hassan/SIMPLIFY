import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { TeamMember } from "../Models/TeamMember.model.js";
import nodemailer from 'nodemailer';


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD

    }
});


const generateAccessTokenandRefreshToken = async (userID) => {

    try {

        const user = await TeamMember.findById(userID);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new Error(error.message);
    }
}

export const Login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    console.log(email, password);

    try {

        if (!email || !password) {
            return res.status(400).json(new ApiError(400, "Email and Password are required"));
        }

        const user = await TeamMember.findOne({ email: email });

        console.log(user);

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found"));

        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);

        console.log(isPasswordCorrect);

        if (!isPasswordCorrect) {
            return res.status(400).json(new ApiResponse(400, "Invalid Password"));
        }

        const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(user._id);

        const loginUserData = await TeamMember.findById(user._id).select("-password -refreshToken");
        console.log(loginUserData);

        const options = {
            httpOnly: true,
            secure: false, // use HTTPS in prod
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        res.status(200).
            cookie("accessToken", accessToken, options).
            cookie("refreshToken", refreshToken, options).
            json(new ApiResponse(200, { accessToken, loginUserData }));


    }
    catch (error) {
        return res.status(500).json(new ApiError(500, error.message));

    }


});


export const Logout = asyncHandler(async (req, res) => {

    console.log(req.user);
    try {

        await TeamMember.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } }, { new: true });

        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        };

        res.clearCookie("accessToken", options);
        res.clearCookie("refreshToken", options);

        return res.status(200).json(new ApiResponse(200, "Logged Out Successfully"));

    }
    catch (error) {
        return res.status(500).json(new ApiError(500, error.message));

    }

});

export const resetPasswordLink = asyncHandler(async (req, res) => {

    try {
        const { email} = req.body;
        console.log("email",email);

        if (!email) {

            return res.status(400).json(new ApiResponse(400, "Email is required"));
        }


        const checkUser = await TeamMember.findOne({ email }).select('-password -refreshToken -__v ');

        if (!checkUser) {
            return res.status(404).json(new ApiResponse(404, "User not found"));
        }



        // Email options
        const mailOptions = {
            from: "mzhassan980@gmail.com",
            to: checkUser.email,
            subject: "Password Reset Request - Simplify",
            html: `
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 8px; box-shadow: 0 0 8px rgba(0,0,0,0.1);">
        
        <h2 style="color: #007bff; text-align: center;">Password Reset Request</h2>
        
        <p style="font-size: 16px; color: #333;">
          Hi <strong>${checkUser.fullName}</strong>,
        </p>

        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          We received a request to reset your password for your <strong>Simplify</strong> account.
          You can reset your password by clicking the button below.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/new-password/${checkUser._id}"
             style="display:inline-block;background:#007bff;color:white;
                    padding:12px 22px;border-radius:5px;text-decoration:none;
                    font-size:16px;font-weight:500;">
             Reset Your Password
          </a>
        </div>

        <p style="font-size: 14px; color: #777;">
          If you didn’t request a password reset, you can safely ignore this email. 
          This link will expire in 30 minutes for your security.
        </p>

        <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 13px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} Simplify. All rights reserved.
        </p>
      </div>
    </div>
  `,
        };

        transporter.sendMail(mailOptions, function (error, info) {

            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        })


        return res.status(200).json(new ApiResponse(
            {
                data: checkUser,
                message: `Password reset link sent to ${checkUser.email}`,
            }))

    } catch (error) {
        console.error("Email sending failed:", error);

        return res.status(500).json(new ApiResponse(
            {
                data: null,
                message: `Server error: ${error.message}`,
            }))
    }

})

// export const resetPassword = asyncHandler(async (req, res) => {
//     const { email, newPassword } = req.body;

//     if (!email || !newPassword) {
//         return res.status(400).json(new ApiError(400, "Email and New Password are required"));
//     }

//     try {
//         const user = await TeamMember.findOne({ email });

//         if (!user) {
//             return res.status(404).json(new ApiError(404, "User not found"));
//         }

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(newPassword, 10);
//         user.password = hashedPassword;
//         user.refreshToken = null; // logout from all devices (optional)
//         await user.save();

//         return res.status(200).json(new ApiResponse(200, "Password reset successfully"));
//     } catch (error) {
//         return res.status(500).json(new ApiError(500, error.message));
//     }
// });

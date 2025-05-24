import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { upload } from "../middlewares/multer.middleware.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateRefreshAndAccesToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = await refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Access and Referh Token not generated");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // requesting the data from the user
  // data process & validation - not empty
  // check if user already exist: check with username, email
  // check for images , check for avatar
  // upload them to cloudinary, avatar
  // remove the password and refresh token field from response
  // create user object - create entry in db
  // check for user creation
  // return res

  const { fullName, username, email, password } = req.body;
  console.log("email -" + email);

  // if(!fullName) throw new ApiError(400,"FullName field is required")
  // if(!username) throw new  ApiError(400,"username field is required")
  // if(!email) throw new  ApiError(400,"FullName field is required")
  // if(!password) throw new  ApiError(400,"FullName field is required")

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please fill the field");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) throw new ApiError(409, "User already exist");

  console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // let coverImageLocalPath = req.files?.coverImage?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) throw new ApiError(400, "AvatarImage is required");
  if (!coverImageLocalPath) {
    coverImageLocalPath = "";
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar)
    throw new ApiError(400, "avatar image not uploaded successfully");
  if (!coverImage) coverImage;

  const user = await User.create({
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    fullName,
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) throw new ApiError(500, "User not created Successfully");

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username email or password is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccesToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

//for logout user clear the cookies
//clear the refresh token
const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //get the refresh token from the req.cookie
  //if user is using the phone req that from body
  //match whether the token received exist in the database or not
  //if yes create the new refresh token
  const incomingrefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingrefreshToken) throw new ApiError(401, "Unauthorised request");

  try {
    const decodedToken = jwt.verify(
      incomingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedToken) throw new ApiError(401, "Refresh token not valid");

    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "User invalid");

    if (incomingrefreshToken !== user.refreshToken)
      throw new ApiError(401, "invalid refreshToken");
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } = await generateRefreshAndAccesToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newrefreshToken },
          "new refresh token generated"
        )
      );
  } catch (error) {
    throw new ApiError(401, "access Token failed to regenerate");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  //get the op,np,cp from the req body
  //verify the user through the middleware i.e authMiddleware
  //change the user.password field to newpassword
  //return the res

  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!(newPassword === confirmPassword)) {
    throw new ApiError(409, "Confirm Password and New Password does not match");
  }
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(409, "your old password is wrong");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(409, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Current user fetched succssfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "fullName and email is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullName, email },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user }, "Account details updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  //get the avatar image path from the multer which we are going to use as the middleware
  //check whether the image is correct or not - basically not empty
  //find the user by id by another middleware i.e auth
  //replace the image means upload that image into the cloudinary
  //save the data and unselect the password field
  //return the res

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "The avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url)
    throw new ApiError(
      400,
      "The avatar file is not uploaded in the cloudinary"
    );

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User new Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  //get the coverImage from the req.file.path
  //validation for the coverImage
  //if there is image upload that image in the cloudinary and get the url
  //find the user by id and set the coverImage to the latest
  //uncheck the password

  const coverImageLocalPath = req.file.path;
  if (!coverImageLocalPath) throw new ApiError(400, "Cover Image not found");

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url)
    throw new ApiError(400, "Error while uploading the file to the cloudinary");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "CoverImage updated successfully"));
});

const userChannelProfile = asyncHandler(async (req, res) => {
  const {username} = req.params;

  if (!(username?.trim())) throw new ApiError(400, "Enter the user name");

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subsribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "channelSubscribeTo",
      },
    },
    {
      $addFields: {
        subcriberCount: {
          $size: "$subsribers",
        },
        channelSubscribeTo: {
          $size: "$channelSubscribeTo",
        },
        isSubscribed: {
          if: {
            $in: [req.user?._id, "$subsribers.subscriber"],
          },
          then: true,
          else: false,
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subcriberCount: 1,
        channelSubscribeTo: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (channel?.length == 0) {
    throw new ApiError(404, "channel doesnot exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User channel fetched succesfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username:1,
                    avatar:1
                  },
                },
              ],
            },
          },
          {
            $addFields:{
              owner:{
                $first: "$owner"
              }
            }
          }
        ],
      },
    },
  ]);

  return res
  .status(200)
  .json(new ApiResponse(200,user[0].watchHistory,"user watch history fetched successfully"))
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory,
  userChannelProfile
};

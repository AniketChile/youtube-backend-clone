import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { upload } from "../middlewares/multer.middleware.js";

const generateRefreshAndAccesToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = await user.generateAccessToken();
    const accessToken = await user.generateRefreshToken();

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
  // when whter the login fields are empty or not
  // check for user existence
  // check for password
  // generate refresh and access token
  // set the cookies
  // return res

  const { email, username, password } = req.body;
  if (!email && !username) throw new ApiError(409, "Enter the email id");
  if (!password) throw new ApiError(409, "Password field cannot be empty");

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if(!user){
    throw new ApiError(404,"User not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid) throw new ApiError(401,"Password incorrect")

  const {accessToken, refreshToken } = await generateRefreshAndAccesToken(user._id);

  const loggedInUser = await User.findById(user._id).
  select("-password -refreshToken")

  const options = {
    httpOnly:true,
    secure:true,
  }
  return res.status(200).cookie("Token",accessToken,options).cookie("refreshToken",refreshToken,options).json(
    new ApiResponse(200,{
      user:loggedInUser,accessToken,refreshToken
    },"User login successfully")
  )
});

const logOutUser = asyncHandler(async (req, res) => {
  //find the user by id
  //clear the cookies
  // clear the refreshToken
  console.log(req.user.password);
  
  await User.findByIdAndUpdate(req.user._id,{
    $set: {
      refreshToken: undefined
    }
  },{
    new:true
  })

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout successfully"));
});

export { registerUser, loginUser, logOutUser };

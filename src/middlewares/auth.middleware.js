import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyJWT = asyncHandler(async(req,_,next)=>{
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

   if(!token){
    throw new ApiError(401,"Unauthorised request")
   }
  
    const decodedToken =  await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    if(!decodedToken){
      throw new ApiError(500,"Token not generated")
    } 
  
  const user =  await User.findById(decodedToken?._id)
  .select("-password -refreshToken")
  
    if(!user){
      throw new ApiError(401,"Invalid Access Token")
    }
  
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400,"Something went wrong")
  }
})
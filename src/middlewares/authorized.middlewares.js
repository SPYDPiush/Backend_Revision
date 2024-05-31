import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJwt  = asyncHandler( async(req,res,next) => {

  try {
    const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
  
    if(!token){
      throw new apiError(401,"unauthorized user..")
    }
  
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    console.log(decodedToken)
  
    const user = await User.findById(decodedToken._id).select("-password -refreshtoken")
  
    if(!user){
      throw new apiError(401)
    }
  
    req.user=user; //req.user create object , the object name is user and their value is user.
    next()
  } catch (error) {

    throw new apiError(401,"invalid access token")
    
  }

})



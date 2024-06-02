import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadONCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from 'jsonwebtoken'
import mongoose, { mongo } from "mongoose";


const generateAccessTokenAndRefreshToken = async (userid) => {

  try {
    const user = await User.findById(userid)
    const accessToken = await user.generateAccessToken()
    const refreshToken =  await user.generateRefreshToken()

    user.refreshtoken = refreshToken

    await user.save({validateBeforeSave:false})


    return {accessToken,refreshToken}

  } catch (error) {
    throw new apiError(500,"Error found when generate access token or refresh token")
    
  }
}

const registerUser =  asyncHandler( async (req,res) => {
 
  const {username,avatar,fullname,email,password} =  req.body
  // console.log(req.body)


  // check all fields are required 
  // normally go through if else condition to check every field 
  
  // array.some use here to check condition in one time.

  if(
    [username,fullname,email,password].some( (field) => field?.trim() === "")
  ){
    throw new apiError(400,"All fields are required.")
  }
 
  // check for user already exist are not
  
  const existedUser = await User.findOne({
    $or: [{username},{email}]
  })

  if(existedUser){
    throw new  apiError(409,"User with email or username already exist.")
  }


  // take a image from frontend section
  // by multer the req have files property which give the access the file
  const avatarLocalpath = req.files?.avatar[0]?.path

  // console.log("Check Avatar : ", req.files.avatar)
  // const coverimageLocalpath = req.files?.coverimage[0]?.path  // show error because do not check cover image is present or not 
  // show error which is cannot read properties of undefined by this error becasue coverimagelocalpath gives undefined and line 59 when extract url from it . it show error.
  // to remove the error which occurs from coverimagelocalpath 

  let coverimageLocalpath

  if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0){
        coverimageLocalpath = req.files.coverimage[0].path
    
  }
  if(!avatarLocalpath){
    throw new apiError(400,"Avata is required")
  }

  // upload on cloudinary 


  const avatarUrl = await uploadONCloudinary(avatarLocalpath)

  const coverUrl = await uploadONCloudinary(coverimageLocalpath)

  if(!avatarUrl){
    throw new apiError(400,"avatar is required.")
  }

  // console.log("show avatarUrl: ",avatarUrl)

  const user = await User.create({
    fullname,
    avatar: avatarUrl.url,
    coverimage: coverUrl?.url || "",
   email,
   password,
   username: username.toLowerCase()
  })

  
  const createuser = await User.findById(user._id).select("-password -refreshtoken")

  if(!createuser){
    throw new apiError(500,"something went wrong while registering the user")
  }

  
return res.status(201).json(
  new apiResponse(200,createuser,"User Register successfully")
)


})



const loginUser =  asyncHandler( async (req,res) => {



  // take data from frontend
  // check required entity are not empty
  // check the login user is register or not in db


  const {username,email,password} =  req.body

  

  if(!(username || email)){
    throw new apiError(400,"email or username is required ")
  }


  // find user in Database...
  const user = await User.findOne({
    $or:[
      {email},
      {username}
    ]
  })

  // check user is present in db or not


  if(!user) throw new apiError(404,"user not found")


    // if user exist check password 

    const correctPassword =await user.isPasswordCorrect(password)

    // if password wrong throw error

    if(!correctPassword) throw new apiError(401,"password wrong..")

    // now generate access token and refesh token 

    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id);


    const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")

    const option={
      httpOnly:true,
      secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
      new apiResponse(
        200,
        {data:loggedInUser,accessToken,refreshToken},
        "user LoggedIn successfully"
      )
    )

})



const logoutUser =  asyncHandler(async (req,res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshtoken : 1,
      }
    },
    {
      new: true
    }
  )


  const option={
    httpOnly:true,
    secure: true
  }


  return res.status(200).
  clearCookie("accessToken",option)
  .clearCookie("refreshToken",option)
  .json(
    new apiResponse(200,{},"User Logout")
  )
})


const refreshAccessToken = asyncHandler( async (req,res) => {

  const incommingRefreshTOken =  req.cookies.refreshToken || req.body.refreshToken



  if(!incommingRefreshTOken){
    throw new apiError(401,"unauthorized request")
  }

  try {

    const decodedToken = jwt.verify(incommingRefreshTOken,process.env.REFRESH_TOKEN_SECRET)
    

    if(!decodedToken){
      throw new apiError(401,"unathorized access")
    }

    const user = await User.findById(decodedToken._id)

 

    if(!user){
      throw new apiError(400,"invalid refresh token")
    }


    if(incommingRefreshTOken != user.refreshtoken){
      throw new apiError(401,"refresh token expired")
    }

    

    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    
    const option = {
      httpOnly:true,
      secure: true
    }

    return res.status(201)
    .cookie("accesToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
      201,
      {accessToken,refreshToken},
      "generate access token successfully" 
    )




    
  } catch (error) {

    throw new apiError(401,error?.messsage || "invalid refresh token")
    
  }



})


const changeCurrentPassword = asyncHandler( async(req,res) => {

  const {oldPassword,newPassword} = req.body


  const user =  await User.findById(req.user?._id)

  if(!user){
    throw new apiError(401,"Invalid authorization")
  }

  const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new apiError(400,"old password not correct")
  }

  user.password= newPassword

  await user.save({validateBeforeSave:false})

  return res.status(200).json(
    new apiResponse(200,{},"Password change successfully")
  )



})


const getCurrentUser = asyncHandler( async(req,res) => {
  const currentUser =  req.user

  return res.status(201).json(
    new apiResponse(201,req.user,"Current user fetched successfully")
  )
})

const updateAvatar = asyncHandler( async(req,res) => {

  const updateAvatarLocalPath = req.file?.path

  if(!updateAvatarLocalPath){
    throw new apiError(401,"avatar fill is missing")
  }

  const updateAvatarUrl = await uploadONCloudinary(updateAvatarLocalPath)

  if(!updateAvatarUrl){
    throw new apiError(400,"error while uploading avatar on cloud")
  }


  const user = await User.findByIdAndUpdate(req.user?._id,{
    $set:{
      avatar : updateAvatarUrl.url
    }
    
  },
  {
    new : true
  }).select("-password -refreshtoken")

  // ////////////////// update avatar this method also //////////////////
  // const user =await User.findById(req.user?._id)

  // if(!user){
  //   throw new apiError(401,"unauthorised user")
  // }

  // user.avatar=updateAvatarUrl.url

  // user.save({validateBeforeSave:false})


  // ////////////// method update end here....... ////////////


  return res.status(200)
  .json( 
    new apiResponse(200,user,"Avatar updated Successfully")
  )

})


const getUserChannelProfile = asyncHandler( async (req,res) => {

  const {username} = req.params;

  if(!username?.trim()){
    throw new apiError(401,"username not found .")
  }

  const channelDetails = User.aggregate([
    {
      $match : {
        username : username
      }
    },
    {
      $lookup : {
        from: "subscriptions",
        localField : "_id",
        foreignField : "Channel",
        as : "Subscribers"
      }
    },
    {
      $lookup : {
        from: "subscriptions",
        localField : "_id",
        foreignField : "Subscriber",
        as : "SubscribedTo"
      }
    },
    {
      $addFields : {
        subscribersCount:{
          $size:"Subscribers"
        },
        channelsSubscribedToCount:{
          $size:"SubscribedTo"
        },
        
          isSubscribed:{
            $cond:{
              if:{$in : [req.user?._id,"$subcribers.Subscriber" ]},
              then:true,
              else:false
  
            }
          }
      }
    },
    {
      $project:{
        fullname:1,
        email:1,
        username:1,
        avatar:1,
        coverimage:1,
        watchhistory:1,
        subscribersCount:1,
        channelsSubscribedToCount:1,
        isSubscribed:1

      }
    }
  ])

  console.log(channelDetails)

if(!channelDetails?.length){
  throw new apiError(404,"channel does not exist")
}

return res.status(200)
.json(new apiResponse(200,channelDetails[0],"channel details fetch successfully"

))
})

const getWatchHistory = asyncHandler( async(req,res) => {

  const user =await User.aggregate([{
    $match:{
      _id : mongoose.Types.ObjectId(req.user?._id)
    }
  },
  {
    $lookup:
    {
      from:"videos",
      localField:"watchhistory",
      foreignField:"_id",
      as:"watchHistory",
      pipeline:[
        {
          $lookup:{
            from: "users",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:[
              {
                $project:{
                  fullname:1,
                  username:1,
                  avatar:1
                }
              }
            ]
          }
        },
        {
          $addFields:{
            owner:{
              $first:"owner"
            }
           
          }
        }
      ]
    }
  }
])


return res.status(200).json(new apiResponse(200,user[0].watchHistory,"watch History fetched successfully"))







})



export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAvatar,getUserChannelProfile,getWatchHistory}


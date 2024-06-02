import { Router } from "express";
import { loginUser, registerUser,logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAvatar, getUserChannelProfile, getWatchHistory } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/authorized.middlewares.js";


const userRouter =  Router()


userRouter.route('/register').post(
  upload.fields([
{
  name: "avatar",
  maxCount: 1
},
{
  name: "coverimage",
  maxCount : 1
}
  ]),
  registerUser)


userRouter.route('/login').post(loginUser)

userRouter.route('/logout').post(verifyJwt,logoutUser)

userRouter.route('/refresh-token').post(refreshAccessToken)


userRouter.route('/changepassword').post(verifyJwt,changeCurrentPassword)

userRouter.route('/currentuser').get(verifyJwt,getCurrentUser)

userRouter.route('/updateavatar').patch(verifyJwt,upload.single("avatar"),updateAvatar)

userRouter.route('/c/:username').get(verifyJwt,getUserChannelProfile)

userRouter.route('/watchhistory').get(verifyJwt,getWatchHistory)





export {userRouter};
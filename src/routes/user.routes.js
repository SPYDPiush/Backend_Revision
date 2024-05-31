import { Router } from "express";
import { loginUser, registerUser,logoutUser, refreshAccessToken } from "../controllers/user.controllers.js";
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





export {userRouter};
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      index: true,
      lowercase: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverimage: {
      type: String, // cloudinary url
    },
    watchhistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshtoken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordcorrect = async function(password){
  return await bcrypt.compare(this.password,password)
}

userSchema.methods.generateAccessToken = function(){

  return jwt.sign({
    _id:this._id,
    username: this.username,
    fullname : this.fullname,
    email:this.email
  },process.env.ACCESS_TOKEN_SECRET,{
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  })
}

userSchema.methods.generateRefreshToken = function(){

  return jwt.sign({
    email:this.email
  },process.env.REFRESH_TOKEN_SECRET,{
    expiresIn:REFRESH_TOKEN_EXPIRY
  })
}



export const User = mongoose.model("User", userSchema);

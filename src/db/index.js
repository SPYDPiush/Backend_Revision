import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () =>{
  try {

    const connectionInstance = await mongoose.connect(`${process.env.DATABSE_URI}/${DB_NAME}`)
    console.log(`\n mongoose connected ${connectionInstance.connection}`)
    
  } catch (error) {
    console.log(`MongoDB connection Failed ${error}`)
    process.exit(1)
    
  }
}

export default connectDB;
import {v2 as cloudinary} from "cloudinary";
import fs from 'fs';


cloudinary.config({ 
  cloud_name:process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET // Click 'View Credentials' below to copy your API secret
});




const uploadONCloudinary = async (localfilepath) =>{
  try {

    if(!localfilepath) return null
    const response = await cloudinary.uploader.upload(localfilepath,{
      resource_type:"auto"
    })

    fs.unlinkSync(localfilepath)
    console.log(response)
    return response

    console.log("file is uploaded on cloudinary")
    
  } catch (error) {
    fs.unlinkSync(localfilepath);
    return null
  }

}


export {uploadONCloudinary}
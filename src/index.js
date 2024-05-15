
import express from 'express';
import connectDB from './db/index.js';
// require('dotenv').config({path: './env'})

import dotenv from 'dotenv';

dotenv.config({
  path : './env'
})


const app =  express();
connectDB()

app.listen(process.env.PORT || 4040,() => {
  console.log(`app is listen at ${process.env.PORT}`)
})




















// ;( async () => {
//   try {

//     await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`);
//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening at ${process.env.PORT}`);

//     })

    
//   } catch (error) {
//     console.log(`Error in try catch section ${error}`)
//     throw error
    
//   }
// })();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials: true
})) // app.use for middlewares

app.use(express.json({
  limit:"16kb"
}))

app.use(express.urlencoded({
  extended: true,
  limit:"16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

export const app = express()

import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors'


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended:true, limit:'16kb'}))
app.use(express.static('public'))
app.use(cookieParser())


// Import Routes
import userRouter from "./routes/user.routes.js";
import propertyRouter from './routes/property.routes.js'
import likeRouter from'./routes/like.routes.js'

//Routes Declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/properties', propertyRouter)
app.use('/api/v1/likes', likeRouter)


export { app };

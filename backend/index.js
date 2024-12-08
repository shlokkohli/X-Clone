import { app } from './app.js'
import dotenv from 'dotenv'
import connectDB from './db/index.js'
import { v2 as cloudinary } from 'cloudinary';

dotenv.config({
    path: '../.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("MONGO db connection failed !!! ", error)
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})
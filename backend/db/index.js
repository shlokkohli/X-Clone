import mongoose from "mongoose";
import { DB_NAME } from '../constants.js'
import dotenv from 'dotenv';

dotenv.config({
    path: '../.env'
})

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/twitter-clone`);
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1);
    }
}

export default connectDB;
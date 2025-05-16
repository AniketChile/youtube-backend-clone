import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectDB = async ()=>{
    try {
        const MONGO_URI = await process.env.MONGODB_URI;
        console.log(MONGO_URI);
        const connection =  await mongoose.connect(`${MONGO_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST : ${connection.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error:"+error);
        process.exit(1);
    }
}

export default connectDB
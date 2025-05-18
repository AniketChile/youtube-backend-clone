import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

/* 
    When we connect to the database we need to self remind 2 important things so that it's meets business requirement
    1. The database is in another continent (means it will take time) so use Async await 
    2. Write the code in the try&catch block for future remedy
*/
const connectDB = async() => {
    try {
    //   console.log("Connecting to MongoDB:", process.env.MONGODB_URI.replace(/:\/\/.*?:.*?@/, '://<credentials>@'));
       const connectionInstance =  await mongoose.connect(`mongodb+srv://aniket123:b7Jozt1YMQ5esSmG@cluster0.rvsfv1q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/${DB_NAME}`);
        console.log(`\n MongoDb connected !! Db host: ${connectionInstance.connection.host}`);
    
    } catch (error) {
        console.log("MONGODB connection error",error);
        process.exit(1)
    }
}

export default connectDB;
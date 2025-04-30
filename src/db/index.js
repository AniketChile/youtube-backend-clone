import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


/* 
    When we connect to the database we need to self remind 2 important things so that it's meets business requirement
    1. The database is in another continent (means it will take time) so use Async await 
    2. Write the code in the try&catch block for future remedy
*/
const connectDB = async() => {
    try {
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDb connected !! Db host: ${connectionInstance.connection.host}`);
    
    } catch (error) {
        console.log("MONGODB connection error",error);
        process.exit(1)
    }
}

export default connectDB;
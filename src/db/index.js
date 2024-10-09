import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {

    // for data base :
    // 1. try catch for errrors
    // 2. db is in another continent: async await
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MONGODB connection ERROR: ",error);
        process.exit(1)
    }
}


export default connectDB;
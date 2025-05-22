import mongoose,{ Schema } from "mongoose";

const subscriptonSchema = new Schema({
    subscriber :{
        type : Schema.Types.ObjectId, //one who is subsrcribing
        ref : "User"
    },
    channel : {
        type : Schema.Types.ObjectId, //one to whom subsriber is subsribing
        ref : "User"
    }
},{timestamps : true})

export const Subscription = mongoose.model("Subscription",subscriptonSchema)
import mongoose, { Schema } from "mongoose";
import jwt  from "jsonwebtoken";
import bcrypt from bcrypt;

const userSchema = new Schema(
  {
    watchHistory: [{
      type: Schema.Types.ObjectId,
      ref: Video,
    }],
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String,
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = async function(){
    await jwt.sign(
        {
            _id
        }
    )
}
userSchema.methods.generateRefreshToken = async function(){

}


export const User = mongoose.model("User", userSchema);

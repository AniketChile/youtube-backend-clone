import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app = express()
//app.use() is used when we want to inject the middleware, we have to pass the info into the parameter.

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"})) //limiting on receiving the data 
app.use(express.urlencoded({extended:true,limit:"16kb"})) //spaces and nested object and limitation on the url
app.use(express.static("public")) //public folder is been created that can be acceses to any one
app.use(cookieParser()) 


export {app}
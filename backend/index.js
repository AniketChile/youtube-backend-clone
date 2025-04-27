import express from "express";
import dotenv from "dotenv";

dotenv.config(); // dotenv ko initialize karna zaroori hai!

const app = express();
const port = process.env.PORT || 3000; // fallback 3000 in case .env missing

app.get('/', (req, res) => {
    res.send("Hello World!");
});

app.get('/about', (req, res) => {
    res.send("About");
});

app.get('/api/jokes',(req,res)=>{
    const jokes =[
        {
            id:1,
            title:"What do you call a bear with no teeth?",
            content:"A gummy bear!"
        },{
            id:2,
            title:"What do you call a bear with no teeth?",
            content:"A tummy bear!"
        },{
            id:3,
            title:"What do you call a bear with no teeth?",
            content:"A rummy bear!"
        }
    ]
    res.send(jokes);
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

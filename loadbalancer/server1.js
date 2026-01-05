import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
const PORT=process.env.PORT1  
const app = express()
app.get("/",async (req,res)=>{
    console.log("on server 1 bro")
    setTimeout(() => {
        console.log("finsishe d")
        res.json({ success: true, msg: "on server 1" });
    }, 10000);
})

app.get("/health",(req,res)=>{
    console.log("in the healt server1")
    
    return res.status(200).send("ok")
})
// app.get("/test",(req,res)=>{
//     setTimeout(() => {
//         console.log("done now");
//         res.json({success:true,msg:"on server 1 testing"});
//     }, 10000);
//     res.json({success:true,msg : "testing done on server 1"})
// })
app.listen(PORT,()=>{
    console.log(` http://localhost:${PORT}`)
})
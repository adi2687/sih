import mongoose from "mongoose";

const connect=async (mongoUrl)=>{
    try{
    await mongoose.connect(mongoUrl)
    console.log("connected to database")
    }catch(err){
        console.log("error ",err)
    }
    
}

export default connect

const mongoose = require("mongoose");

const connectDB = async()=>{
    try {
        mongoose.connection.on("connected",()=>console.log("database Connected"))
        await mongoose.connect(`${process.env.MONGODB_URI}`)
    } catch (error) {
        console.log(error.message)
    }
}
module.exports = connectDB;
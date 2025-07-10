
// const { clerkClient ,getAuth} = require('@clerk/express');


// const Booking = require("../models/Booking");
// const Movie = require('../models/Movie');


// const getUserBokkings = async(req,res)=>{
//     try{
//         const user = req.auth().userId
      
//         const bookings = await Booking.find({user}).populate({
//             path:"show",
//             populate:{path:"movie"}

//         }).sort({createdA:-1})
//         return res.json({
//             success:true,
//             bookings
//         })


//     } catch(error){
//         console.error(error.message)
//         res.json({
//             success:false,
//             message:error.message
//         })


//     }

// }

// //API Controller function to update favorite movie in clerk user metadata

// const updateFavourite = async(req,res)=>{
//     try{
//         const {movieId} = req.body;
//         //const userId = req.auth().userId;

//         const userId = getAuth(req).userId;
//         const user = await clerkClient.users.getUser(userId)
//         if(!user.privateMetadata.favorites){
//             user.privateMetadata.favorites =[]
//     }
//     if(!user.privateMetadata.favorites.includes(movieId)){
//         user.privateMetadata.favorites.push(movieId)
//     }else{
//         user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId)
//     }
//     await clerkClient.users.updateUserMetadata(userId,{privateMetadata:user.privateMetadata})
//     return res.json({
//         success:true,
//         message:"Favourite movie updated successfully"
//     })
//     } catch(error){
//         console.error(error.message)
//         res.json({
//             success:false,
//             message:error.message
//         })

//     }


// }

// const getFavourites = async(req,res)=>{
//     try{
//         const user = await clerkClient.users.getUser(req.auth().userId)
//         const favorites = user.privateMetadata.favorites;

//         //getting movies from database
//         const movies = await Movie.find({_id:{$in:favorites}})
//         return res.json({
//             success:true,
//             movies
//         })
//     } catch(error){
//          console.error(error.message)
//         res.json({
//             success:false,
//             message:error.message
//         })

//     }
// }

// module.exports = {getUserBokkings,updateFavourite,getFavourites}
const { clerkClient, getAuth } = require('@clerk/express');
const Booking = require("../models/Booking");
const Movie = require('../models/Movie');

// ✅ 1. Get user bookings
const getUserBokkings = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        console.log("📌 getUserBokkings: userId =", userId); // ✅ LOG HERE

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const bookings = await Booking.find({ user: userId }).populate({
            path: "show",
            populate: { path: "movie" }
        }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            bookings
        });

    } catch (error) {
        console.error("❌ getUserBokkings error:", error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// ✅ 2. Update favourite movie
const updateFavourite = async (req, res) => {
    try {
        const { movieId } = req.body;
        const { userId } = getAuth(req);
        console.log("📌 updateFavourite: userId =", userId); // ✅ LOG HERE

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const user = await clerkClient.users.getUser(userId);
        console.log("✅ Clerk user fetched"); // Optional

        if (!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = [];
        }

        if (!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId);
        } else {
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId);
        }

        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: user.privateMetadata
        });

        return res.json({
            success: true,
            message: "Favourite movie updated successfully"
        });

    } catch (error) {
        console.error("❌ updateFavourite error:", error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// ✅ 3. Get all favourites
const getFavourites = async (req, res) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const user = await clerkClient.users.getUser(userId);
        const favorites = user.privateMetadata.favorites || [];

        const movies = await Movie.find({ _id: { $in: favorites } });

        return res.json({
            success: true,
            movies
        });
    } catch (error) {
        console.error("❌ getFavourites error:", error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getUserBokkings, updateFavourite, getFavourites };

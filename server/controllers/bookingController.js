

//function to check availibility of selected seats for a movie

const { inngest } = require("../inngest/index");
const Booking = require("../models/Booking");
const Show = require("../models/Show")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const checkSeatsAvailibility = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId)
        if (!showData) return false;
        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
        return !isAnySeatTaken;

    } catch (error) {
        console.log(error.message);
        return false;

    }

}

// const createBooking = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const { showId, selectedSeats } = req.body;
//         const { origin } = req.headers;

//         //check if the seat is availabel for selected show

//         const isAvailable = await checkSeatsAvailibility(showId, selectedSeats)
//         if (!isAvailable) {
//             return res.json({
//                 success: false,
//                 message: "Selected seats are not available."
//             })
//         }
//         //Get the show details

//         const showData = await Show.findById(showId).populate("movie")

//         //create a new booking

//         const booking = await Booking.create({
//             user: userId,
//             show: showId,
//             amount: showData.showPrice * selectedSeats.length,
//            bookedSeats: selectedSeats 

//         })
//         selectedSeats.map((seat) => {
//             showData.occupiedSeats[seat] = userId;

//         })
//         showData.markModified("occupiedSeats");
//         await showData.save()

//         //stripe payment getway initialize
//         const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
//         //line-items for stripe

//         const line_items = [{
//             price_data:{
//                 currency:"inr",
//                 product_data:{
//                     name:showData.movie.title,
                
//                 },
//                 unit_amount:Math.floor(booking.amount) *100
//             },
//             quantity:1
//         }]
//         const session = await stripeInstance.checkout.sessions.create({
//             success_url:`${origin}/loading/my-bookings`,
//             cancel_url:`${origin}/my-bookings`,
//             line_items:line_items,
//             mode:'payment',
//             metadata:{
//                 bookingId:booking._id.toString()

//             },
//             expires_at:Math.floor(Date.now()/1000) + 30 *60
//         })
//         booking.paymentLink = session.cancel_url
//         await booking.save()



//         res.json({
//             success: true,
//             url:session.url
//         })
//     } catch (error) {
//         console.log(error.message)
//         res.json({
//             success: false,
//             message: error.message
//         })
//     }

// }

const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    // Check seat availability
    const isAvailable = await checkSeatsAvailibility(showId, selectedSeats);
    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected seats are not available.",
      });
    }

    // Fetch show and movie details
    const showData = await Show.findById(showId).populate("movie");

    // Create booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    // Mark seats as occupied
    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified("occupiedSeats");
    await showData.save();

    // Stripe payment session
    const line_items = [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: showData.movie.title,
          },
          unit_amount: Math.floor(booking.amount * 100), // in paise
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items,
      mode: "payment",
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // expires in 30 minutes
    });

    booking.paymentLink = session.cancel_url;
    await booking.save();
    //run inngest schedular function to check payment status affter 10 minuites
    await inngest.send({
      name:"app/checkpayment",
      data:{
        bookingId:booking._id.toString()
      }
    })
    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};


const getOccupiedSeats = async(req,res)=>{
    try{
        const {showId} = req.params;
        const showData = await Show.findById(showId)
        const occupiedSeats = Object.keys(showData.occupiedSeats)
        return  res.json({
            success: true,
            occupiedSeats
        })
    } catch(error){
        console.log(error.message)
        res.json({
            success: false,
            message: error.message
        })
    }

}

module.exports = {checkSeatsAvailibility,createBooking,getOccupiedSeats}


//function to check availibility of selected seats for a movie

const Booking = require("../models/Booking");
const Show = require("../models/Show")

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

const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;
        const { origin } = req.headers;

        //check if the seat is availabel for selected show

        const isAvailable = await checkSeatsAvailibility(showId, selectedSeats)
        if (!isAvailable) {
            return res.json({
                success: false,
                message: "Selected seats are not available."
            })
        }
        //Get the show details

        const showData = await Show.findById(showId).populate("movie")

        //create a new booking

        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookingSeats: selectedSeats

        })
        selectedSeats.map((seat) => {
            showData.occupiedSeats[seat] = userId;

        })
        showData.markModified("occupiedSeats");
        await showData.save()

        //stripe payment getway initialize
        res.json({
            success: true,
            message: "Booked Successfully"
        })
    } catch (error) {
        console.log(error.message)
        res.json({
            success: false,
            message: error.message
        })
    }

}

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
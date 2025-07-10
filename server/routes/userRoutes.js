
const express = require("express");
const { updateFavourite, getFavourites, getUserBokkings } = require("../controllers/userController");

const router = express.Router();

router.get("/bookings",getUserBokkings)
router.post("/update-favorite",updateFavourite)
router.get('/favourites',getFavourites)

module.exports = router;
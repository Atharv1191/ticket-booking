
const axios = require("axios");
const Movie = require("../models/Movie");
const Show = require("../models/Show");

const getNowPlayingMovies = async(req,res)=>{
    try{
       const {data} = await axios.get("https://api.themoviedb.org/3/movie/now_playing",{
            headers:{Authorization:`Bearer ${process.env.TMDB_API_KEY}`}

        })
        const movies = data.results;
        res.json({
            success:true,
            movies:movies
        })

    } catch(error){
        console.log( error)
        res.json({
              success:false,
              message:error.message
        })

    }

}
//API to add a new show to a database




const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`
          }
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`
          }
        }),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        casts: movieCreditsData.cast,
        genres: movieApiData.genres,
        release_date: movieApiData.release_date,
        orignal_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };

      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];

    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        const dateTime = new Date(dateTimeString);

        if (dateTime > new Date()) {
          showsToCreate.push({
            movie: movieId,
            showDateTime: dateTime,
            showPrice,
            occupiedSeats: {},
          });
        } else {
          console.log("⏱️ Skipping past show time:", dateTime.toISOString());
        }
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({
      success: true,
      message: "Shows added successfully",
    });
  } catch (error) {
    console.error("❌ Error in addShow:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
      response: error.response?.data || null,
    });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};








// API to get all shows from database

const getShows = async (req, res) => {
  try {
    const now = new Date();

    // Find all upcoming shows and populate movie data
    const shows = await Show.find({ showDateTime: { $gte: now } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    console.log(`🔍 Current Time: ${now.toISOString()}`);
    console.log(`🎬 Found ${shows.length} upcoming shows`);

    // Filter out any shows with missing movie data (e.g., deleted)
    const validShows = shows.filter(show => show.movie);

    // Create a map to store unique movies
    const movieMap = new Map();
    for (const show of validShows) {
      const movieId = show.movie._id.toString();
      if (!movieMap.has(movieId)) {
        movieMap.set(movieId, show.movie);
      }
    }

    res.json({
      success: true,
      shows: Array.from(movieMap.values()),
    });
  } catch (error) {
    console.error("❌ Error in getShows:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


//API to get single shows

const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    // get all upcoming shows for the movie
    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });

    const movie = await Movie.findById(movieId);

    // ✅ Define dateTime before using it
    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];

      if (!dateTime[date]) {
        dateTime[date] = [];
      }

      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
      });
    });

    res.json({
      success: true,
      movie,
      dateTime,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {getNowPlayingMovies,addShow,getShows,getShow}
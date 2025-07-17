
import React, { useEffect, useState } from 'react';
import { CheckIcon, DeleteIcon, StarIcon } from 'lucide-react';
import Loading from '../../components/Loading';
import Title from './Title';
import { useAppContext } from '../../context/AppContext';
import { kConverter } from '../../lib/Kconverter';
import toast from 'react-hot-toast';

const AddShows = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || '₹';

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [showPrice, setShowPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingShow, setAddingShow] = useState(false);

  const fetchNowPlayingMovies = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get('/api/shows/now-playing', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setNowPlayingMovies(data.movies);
      } else {
        console.error("❌ Backend returned unsuccessful response.");
      }
    } catch (error) {
      console.error("❌ Error fetching movies:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection(prev => {
      const times = prev[date] || [];
      return {
        ...prev,
        [date]: [...times, time],
      };
    });

    setDateTimeInput("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection(prev => {
      const filteredTimes = prev[date].filter(t => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setAddingShow(true);
      if (!selectedMovie || Object.keys(dateTimeSelection).length === 0 || !showPrice) {
        toast.error("Missing required fields");
        return;
      }

      const showsInput = Object.entries(dateTimeSelection).map(([date, times]) => ({
        date,
        time: times,
      }));

      const payload = {
        movieId: selectedMovie,
        showsInput,
        showPrice: Number(showPrice),
      };

      const { data } = await axios.post('/api/shows/add', payload, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

      if (data.success) {
        toast.success(data.message);
        setSelectedMovie(null);
        setDateTimeSelection({});
        setShowPrice("");
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.error("submission error", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setAddingShow(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNowPlayingMovies();
    }
  }, [user]);

  if (loading) return <Loading />;

  if (!loading && nowPlayingMovies.length === 0) {
    return <p className="text-center text-gray-400 mt-10">No movies found.</p>;
  }

  return (
    <>
      <Title text1="Add" text2="Shows" />
      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>

      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4">
          {nowPlayingMovies.map((movie) => (
            <div
              onClick={() => setSelectedMovie(movie.id)}
              key={movie.id}
              className="relative w-36 sm:w-40 cursor-pointer transition duration-300 group-hover:opacity-40 hover:opacity-100 hover:-translate-y-1"
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  className="w-full h-60 object-cover brightness-90"
                  src={image_base_url + movie.poster_path}
                  alt={movie.title}
                />
                <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                  </p>
                  <p className="text-gray-300">
                    {kConverter(movie.vote_count)} Votes
                  </p>
                </div>
              </div>
              <p className="font-medium truncate mt-1">{movie.title}</p>
              <p className="text-gray-400 text-sm">{movie.release_date}</p>

              {selectedMovie === movie.id && (
                <div className='absolute top-2 right-2 flex items-center justify-center bg-primary w-6 h-6 rounded'>
                  <CheckIcon className='w-4 h-4 text-white' strokeWidth={2.5} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className='mt-8 w-full max-w-xs'>
        <label htmlFor='showPrice' className='block text-sm font-medium mb-2'>
          Show Price
        </label>
        <div className='inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md'>
          <span className='text-gray-400 text-sm'>{currency}</span>
          <input
            id='showPrice'
            min={0}
            type='number'
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder='Enter Show Price'
            className='bg-transparent text-white placeholder-gray-500 text-sm outline-none w-full'
          />
        </div>
      </div>

      <div className='mt-6 w-full max-w-xs'>
        <label className='block text-sm font-medium mb-2'>Select Date and Time</label>
        <div className='flex gap-3 items-center'>
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className='outline-none rounded-md text-sm text-white px-2 py-1 border border-gray-500'
          />
          <button
            onClick={handleDateTimeAdd}
            className='bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer'
          >
            Add Time
          </button>
        </div>
      </div>

      {Object.keys(dateTimeSelection).length > 0 && (
        <div className='mt-6'>
          <h2 className='space-y-3'>Selected Date-Time</h2>
          <ul className='space-y-3'>
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date} className='font-medium'>
                <div>{date}</div>
                <div className='flex flex-wrap gap-2 mt-1 text-sm'>
                  {times.map((time) => (
                    <div key={time} className='border border-primary px-2 py-1 flex items-center rounded'>
                      <span>{time}</span>
                      <DeleteIcon
                        onClick={() => handleRemoveTime(date, time)}
                        width={15}
                        className='ml-2 text-red-500 hover:text-red-700 cursor-pointer'
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={addingShow}
        className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer'
      >
        {addingShow ? "Adding..." : "Add Show"}
      </button>
    </>
  );
};

export default AddShows;

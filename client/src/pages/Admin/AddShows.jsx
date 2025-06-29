import React, { useEffect, useState } from 'react'
import { dummyShowsData } from '../../assets/assets'
import Loading from '../../components/Loading'
import Title from './Title'
import { CheckIcon, DeleteIcon, StarIcon } from 'lucide-react'
import { kConverter } from '../../lib/Kconverter'

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [dateTimeInput, setDateTimeInput] = useState("")
  const [dateTimeSelection, setDateTimeSelection] = useState({})
  const [showPrice, setShowPrice] = useState("")

  const fetchNowPlayingMovies = async () => {
    setNowPlayingMovies(dummyShowsData)
  }

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return
    const [date, time] = dateTimeInput.split("T")
    if (!date || !time) return

    setDateTimeSelection(prev => {
      const times = prev[date] || []
      return {
        ...prev,
        [date]: [...times, time]
      }
    })

    // Clear input after adding
    setDateTimeInput("")
  }
 const handleRemoveTime = (date, time) => {
  setDateTimeSelection((prev) => {
    const filteredTimes = prev[date].filter((t) => t !== time);

    if (filteredTimes.length === 0) {
      const { [date]: _, ...rest } = prev;
      return rest;
    }

    return {
      ...prev,
      [date]: filteredTimes
    };
  });
};


  useEffect(() => {
    fetchNowPlayingMovies()
  }, [])

  return nowPlayingMovies.length > 0 ? (
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
                  src={movie.poster_path}
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

      {/* Show price input */}
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

      {/* Date and time selection */}
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
      {/* display selected times */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className='mt-6'>
          <h2 className='space-y-3'>Selected Date-Time</h2>
          <ul className='space-y-3'>
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date} className='font-medium'>
                <div className='font-medium'>
                  {date}
                </div>
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
      <button className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer'>
      Add Show

      </button>

    </>
  ) : (
    <Loading />
  )
}

export default AddShows

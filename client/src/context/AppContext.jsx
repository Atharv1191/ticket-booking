// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios"
// import { useAuth, useUser } from "@clerk/clerk-react";
// import { useLocation, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

// export const AppContext = createContext()

// export const AppProvider =({Children})=>{
//     const [isAdmin,setIsAdmin] = useState(false)
//     const [shows,setShows] = useState([])
//     const [favouiriteMovie,setFavouriteMovie] = useState([])

//     const {user} = useUser()
//     const {getToken} = useAuth()
//     // const location = useLocation()
//     const navigate = useNavigate()

//     const fetchIsAdmin = async()=>{
//         try {
//             const {data} = await axios.get('/api/admin/is-admin',{headers:{Authorization:`Bearer ${await getToken()}`}})
//             setIsAdmin(data.isAdmin)
//             if(!data.isAdmin && location.pathname.startsWith('/admin')){
//                 navigate('/')
//                 toast.error("You are not authorized to access admin dashboared")

//             }
//         } catch (error) {
//             console.error(error)
//         }
//     }

//     const fetchShows = async()=>{
//         try {
//             const {data} = await axios.get('/api/shows/all')
//             if(data.success){
//                 setShows(data.shows)
//             }else{
//                 toast.error(data.message)
//             }

            
//         } catch (error) {
//              console.error(error)
//         }
//     }

    
//     const fetchFavouiriteMovies = async()=>{
//         try {
//             const {data} = await axios.get('/api/user/favourites',{headers:{Authorization:`Bearer ${await getToken()}`}})
//             if(data.success){
//                 setFavouriteMovie(data.movies)
//             }else{
//                 toast.error(data.message)
//             }

            
//         } catch (error) {
//              console.error(error)
//         }
//     }



//     useEffect(()=>{
//         fetchShows()
//     },[])
//     useEffect(()=>{
//         if(user){
//         fetchIsAdmin()
//         fetchFavouiriteMovies()
//         }
//     },[user])


//     const value ={axios,fetchIsAdmin,user,getToken,navigate,isAdmin,shows,favouiriteMovie,fetchFavouiriteMovies}
//     return(
//         <AppContext.Provider value={value}>

//             {Children}
//         </AppContext.Provider>
//     )
// }

// export const useAppContext = ()=>useContext(AppContext)

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favouriteMovie, setFavouriteMovie] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL
  const { user, isLoaded } = useUser(); // ✅ Correct
  const { getToken } = useAuth();
  const location = useLocation(); // ✅ Needed
  const navigate = useNavigate();

  const fetchIsAdmin = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/admin/is-admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith('/admin')) {
        navigate('/');
        toast.error("You are not authorized to access the admin dashboard");
      }
    } catch (error) {
      console.error("fetchIsAdmin error:", error);
    }
  };

  const fetchShows = async () => {
    try {
      const { data } = await axios.get('/api/shows/all');
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("fetchShows error:", error);
    }
  };

  const fetchFavouriteMovies = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/favourites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setFavouriteMovie(data.movies);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("fetchFavouriteMovies error:", error);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchIsAdmin();
      fetchFavouriteMovies();
    }
  }, [isLoaded, user]);

  const value = {
    axios,
    fetchIsAdmin,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
    favouriteMovie,
    fetchFavouriteMovies,
    image_base_url
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

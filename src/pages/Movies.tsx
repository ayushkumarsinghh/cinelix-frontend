import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Calendar, Clock, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface Movie {
  id: string;
  title: string;
  duration: number;
  imageUrl?: string;
}

const Movies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('/api/movies');
        setMovies(response.data);
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop" 
          alt="Featured Movie"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 p-8 md:p-16 z-20 w-full md:w-2/3">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter">NOW SHOWING</h1>
          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-xl">
            Experience the latest blockbusters in stunning 4K with Dolby Atmos. Your journey into the world of cinema starts here.
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all">
              <Play className="fill-black" /> Get Tickets
            </button>
            <button className="glass px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all text-white">
              <Info /> More Info
            </button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="px-6 md:px-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Trending Now <ChevronRight className="text-primary" />
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <div 
              key={movie.id}
              onClick={() => navigate(`/movies/${movie.id}/shows`)}
              className="movie-card group cursor-pointer"
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3">
                <img 
                  src={movie.imageUrl || `https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop`} 
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <button className="bg-primary text-white p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Play className="fill-white" />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-semibold truncate group-hover:text-primary transition-colors">{movie.title}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {movie.duration}m</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded uppercase">4K</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Movies;

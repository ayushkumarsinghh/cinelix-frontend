import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Calendar, Clock, ChevronRight, MapPin, Search, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Movie {
  id: string;
  title: string;
  duration: number;
  genre?: string;
  imageUrl?: string;
  trailerUrl?: string;
}

const Movies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [selectedTheatre, setSelectedTheatre] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const genres = ['All', 'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          axios.get('/api/movies'),
          axios.get('/api/theatres')
        ]);
        setMovies(moviesRes.data);
        setTheatres(theatresRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movie.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || movie.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-2 mb-2">
              Trending Now <ChevronRight className="text-primary w-6 h-6" />
            </h2>
            <p className="text-gray-500 text-sm">Discover the most popular movies playing near you.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                placeholder="Search movies, genres..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              />
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 px-3 text-primary">
                <MapPin className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Select Cinema</span>
              </div>
              <select 
                value={selectedTheatre}
                onChange={e => setSelectedTheatre(e.target.value)}
                className="bg-transparent text-white text-sm font-bold focus:outline-none pr-8 cursor-pointer"
              >
                <option value="all" className="bg-gray-900 text-gray-400">All Locations</option>
                {theatres.map(t => (
                  <option key={t.id} value={t.id} className="bg-gray-900 text-white">
                    {t.name} - {t.location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Genre Filter Bar */}
        <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                selectedGenre === genre 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {filteredMovies.map((movie) => (
              <div 
                key={movie.id}
                className="movie-card group cursor-pointer"
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-xl">
                  <img 
                    src={movie.imageUrl || `https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop`} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 p-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/movies/${movie.id}/shows${selectedTheatre !== 'all' ? `?theatreId=${selectedTheatre}` : ''}`);
                      }}
                      className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" /> Get Tickets
                    </button>
                    {movie.trailerUrl && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrailer(movie.trailerUrl!);
                        }}
                        className="w-full glass text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all delay-75"
                      >
                        Watch Trailer
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-white font-bold truncate group-hover:text-primary transition-colors text-lg mb-1">{movie.title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {movie.duration}m</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">4K</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass rounded-[2.5rem] border border-dashed border-white/10">
            <Search className="w-16 h-16 text-gray-700 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">No Movies Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your search or category filters to find what you're looking for.</p>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {selectedTrailer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrailer(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setSelectedTrailer(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all z-10 backdrop-blur-md"
              >
                <X className="text-white w-6 h-6" />
              </button>
              
              <iframe 
                src={getYoutubeEmbedUrl(selectedTrailer) || ''} 
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Movies;

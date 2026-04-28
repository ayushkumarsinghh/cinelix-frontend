import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Info, Calendar, Clock, ChevronRight, MapPin, Search, X, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore - Will resolve once npm install hls.js is complete
import Hls from 'hls.js';
import { recentMovies } from '../constants/mockMovies';

interface Movie {
  id?: string;
  title: string;
  duration: number;
  genre?: string;
  imageUrl?: string;
  trailerUrl?: string;
}

const Movies = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [selectedTheatre, setSelectedTheatre] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const carouselSlides = [
    {
      id: 1,
      title: "cinelix STREAM",
      subtitle: "Step into a world of cinematic desire!",
      buttonText: "Buy/Rent Online",
      image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070",
      color: "from-accent/90"
    },
    {
      id: 2,
      title: "EXCLUSIVE PREMIERE",
      subtitle: "Watch the latest blockbusters from your couch.",
      buttonText: "Watch Now",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070",
      color: "from-blue-600/80"
    },
    {
      id: 3,
      title: "EARN REWARDS",
      subtitle: "Get 20% back on your first 3 bookings.",
      buttonText: "Join Cinelix+",
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070",
      color: "from-purple-600/80"
    }
  ];

  const genres = ['All', 'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller'];

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sync search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [location.search]);

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
        setMovies([]); // Don't show mock data anymore
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = selectedGenre === 'All' || 
                         (movie.genre && movie.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
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
      <div className="min-h-screen flex items-center justify-center bg-[#070b0a]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Promo Banner Carousel */}
      <div className="w-full bg-[#070b0a] pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative w-full h-[200px] md:h-[320px] rounded-2xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.6)] cursor-pointer group">
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img 
                  src={carouselSlides[currentSlide].image} 
                  alt={carouselSlides[currentSlide].title} 
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${carouselSlides[currentSlide].color} to-transparent flex items-center px-8 md:px-16`}>
                  <div className="text-[#070b0a]">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight uppercase">{carouselSlides[currentSlide].title}</h2>
                    <p className="text-xl md:text-3xl font-bold mb-6 text-white drop-shadow-md">{carouselSlides[currentSlide].subtitle}</p>
                    <button className="bg-[#070b0a] text-white hover:bg-white hover:text-[#070b0a] transition-all border-2 border-[#070b0a] px-8 py-2.5 rounded-lg font-bold shadow-lg">
                      {carouselSlides[currentSlide].buttonText}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Carousel Controls */}
            <div className="absolute bottom-6 right-10 flex gap-2 z-10">
              {carouselSlides.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === i ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>

            <button 
              onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)}
              className="absolute top-1/2 -translate-y-1/2 left-4 w-12 h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
            >
              <ChevronRight className="w-7 h-7 rotate-180" />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)}
              className="absolute top-1/2 -translate-y-1/2 right-4 w-12 h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Recommended Movies
            </h2>
            <p className="text-gray-400 text-sm">
              Discover the most popular movies playing near you.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111815] border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-accent transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-[#111815] border border-white/10 px-4 py-2.5 rounded-xl w-full md:w-auto hover:bg-white/5 cursor-pointer transition-colors">
              <MapPin className="text-accent w-5 h-5" />
              <select 
                value={selectedTheatre}
                onChange={(e) => setSelectedTheatre(e.target.value)}
                className="bg-transparent text-white outline-none w-full md:w-auto cursor-pointer font-medium"
              >
                <option value="all" className="bg-[#111815]">All Locations</option>
                {theatres.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#111815]">{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-8 scrollbar-hide">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-6 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-all border ${
                selectedGenre === genre 
                  ? 'bg-accent text-[#070b0a] border-accent shadow-[0_0_20px_rgba(94,210,156,0.3)]' 
                  : 'bg-[#111815] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-16">
            {filteredMovies.map((movie, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                key={movie.id}
                className="bg-[#111815] rounded-2xl overflow-hidden shadow-2xl border border-white/5 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(94,210,156,0.1)] transition-all group flex flex-col cursor-pointer"
                onClick={() => navigate(`/movies/${movie.id}/shows${selectedTheatre !== 'all' ? `?theatreId=${selectedTheatre}` : ''}`)}
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-[#0a0f0c]">
                  <img 
                    src={movie.imageUrl || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"} 
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {movie.trailerUrl && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrailer(movie.trailerUrl!);
                        }}
                        className="w-14 h-14 bg-accent text-[#070b0a] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                      >
                        <Play className="w-6 h-6 ml-1 fill-current" />
                      </button>
                    )}
                  </div>
                  {/* Rating Tag */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-xs font-black text-white flex items-center gap-1.5 border border-white/10 shadow-lg">
                    <span className="text-accent text-sm leading-none">★</span> 8.5
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-accent transition-colors line-clamp-1">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-4 font-medium">
                    <span className="line-clamp-1">{movie.genre || 'Action'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 shrink-0"><Clock className="w-3.5 h-3.5" /> {movie.duration}m</span>
                  </div>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/movies/${movie.id}/shows${selectedTheatre !== 'all' ? `?theatreId=${selectedTheatre}` : ''}`);
                      }}
                      className="w-full bg-accent/5 text-accent border border-accent/30 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-accent hover:text-[#070b0a] hover:border-accent transition-all shadow-sm"
                    >
                      Book Tickets
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-[#111815] rounded-3xl border border-dashed border-white/5">
            <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-xl font-medium">No movies found matching your search.</p>
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

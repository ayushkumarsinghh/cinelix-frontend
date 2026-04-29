import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Info, Calendar, Clock, ChevronRight, MapPin, Search, X, ArrowRight, Star } from 'lucide-react';
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
  backdropUrl?: string;
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

  const isPremium = localStorage.getItem('isPremium') === 'true';

  // Select a random movie for the premium banner
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (isPremium && movies.length > 0) {
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      setFeaturedMovie(randomMovie);
    }
  }, [isPremium, movies]);

  const genres = ['All', 'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller'];

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
        const [moviesRes, theatresRes, showsRes] = await Promise.all([
          axios.get('/api/movies'),
          axios.get('/api/theatres'),
          axios.get('/api/shows')
        ]);
        
        const now = new Date();
        // Filter movies that have at least one FUTURE show
        const activeMovieIds = new Set(
          showsRes.data
            .filter((s: any) => new Date(s.startTime) > now)
            .map((s: any) => s.movieId)
        );
        
        const activeMovies = moviesRes.data.filter((m: any) => activeMovieIds.has(m.id));
        
        setMovies(activeMovies);
        setTheatres(theatresRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setMovies([]); 
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
      {/* Promo Banner Section */}
      <div className="w-full bg-[#070b0a] pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          {!isPremium ? (
            /* NON-PREMIUM: SUBSCRIBE PROMO */
            <div className="relative w-full h-[200px] md:h-[320px] rounded-3xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.6)] border border-white/5 group">
              <img 
                src="https://images.unsplash.com/photo-1574267432553-4b202f720e6e?q=80&w=2070" 
                alt="Subscribe" 
                className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070b0a] via-[#070b0a]/80 to-transparent flex items-center px-10 md:px-24">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-[2px] bg-accent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Unlock Everything</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-cinematic text-white mb-4 tracking-tighter leading-none">
                    JOIN <span className="text-accent italic">CINELIX+</span>
                  </h2>
                  <p className="text-sm md:text-base text-gray-300 font-light mb-6 leading-relaxed max-w-md">
                    Get unlimited access to premium premieres, exclusive rewards, and zero convenience fees.
                  </p>
                  <button 
                    onClick={() => navigate('/plans')}
                    className="bg-accent text-[#070b0a] hover:bg-white transition-all px-8 py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-accent/20 flex items-center gap-3 group/btn"
                  >
                    Subscribe Now
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ) : featuredMovie ? (
            /* PREMIUM: FEATURED MOVIE SPOTLIGHT */
            <div className="relative w-full h-[200px] md:h-[320px] rounded-3xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.6)] border border-white/5 group">
              <img 
                src={featuredMovie.backdropUrl || featuredMovie.imageUrl?.replace('/w500/', '/original/')} 
                alt={featuredMovie.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070b0a] via-[#070b0a]/60 to-transparent flex items-center px-10 md:px-24">
                <div className="max-w-2xl text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-[2px] bg-accent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Member Exclusive</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-cinematic mb-4 tracking-tighter leading-none group-hover:text-accent transition-colors">
                    {featuredMovie.title}
                  </h2>
                  <div className="flex items-center gap-6 mb-6">
                    <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10">
                      {featuredMovie.duration} MINS
                    </span>
                    <span className="text-gray-400 font-bold text-xs tracking-wide">
                      {featuredMovie.genre}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <button 
                      onClick={() => navigate(`/movies/${featuredMovie.id}/shows`)}
                      className="bg-accent text-[#070b0a] hover:bg-white transition-all px-8 py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl flex items-center gap-3"
                    >
                      Book Seat
                      <Calendar className="w-4 h-4" />
                    </button>
                    {featuredMovie.trailerUrl && (
                      <button 
                        onClick={() => setSelectedTrailer(featuredMovie.trailerUrl!)}
                        className="bg-white/10 hover:bg-white text-white hover:text-[#070b0a] transition-all px-8 py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] backdrop-blur-md border border-white/10 flex items-center gap-3"
                      >
                        Trailer
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {/* Banner Section End */}

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <div className="bg-[#111815]/40 border border-white/5 rounded-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-8 backdrop-blur-xl">
            <div className="flex items-center gap-6 w-full lg:w-auto">
              <Search className="w-5 h-5 text-accent/60" />
              <div className="flex-1 lg:w-72">
                <p className="text-[9px] text-accent font-bold uppercase tracking-[0.3em] mb-1 opacity-60">Search Collection</p>
                <input
                  type="text"
                  placeholder="Search titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-white text-lg font-cinematic placeholder-gray-800 focus:outline-none tracking-wide"
                />
              </div>
            </div>

            <div className="h-10 w-[1px] bg-white/5 hidden lg:block"></div>

            <div className="flex items-center gap-6 w-full lg:w-auto">
              <MapPin className="w-5 h-5 text-accent/60" />
              <div className="flex-1 lg:w-60">
                <p className="text-[9px] text-accent font-bold uppercase tracking-[0.3em] mb-1 opacity-60">Cinema Venue</p>
                <select 
                  value={selectedTheatre}
                  onChange={(e) => setSelectedTheatre(e.target.value)}
                  className="bg-transparent text-white text-lg font-cinematic outline-none w-full cursor-pointer tracking-wide"
                >
                  <option value="all" className="bg-[#070b0a]">Select Your Cinema</option>
                  {theatres.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#070b0a]">{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="w-full lg:w-auto bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] transition-all border border-white/10">
              Apply Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-1 h-12 bg-accent rounded-full"></div>
            <div>
              <h2 className="text-5xl font-cinematic text-white tracking-tight">
                Now <span className="text-accent italic">Screening</span>
              </h2>
              <p className="text-gray-500 text-[11px] font-medium uppercase tracking-[0.3em] mt-2">
                Handpicked cinematic masterpieces for the discerning viewer
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto pb-12 scrollbar-hide">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-10 py-3 rounded-full whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
                selectedGenre === genre 
                  ? 'bg-accent text-[#070b0a] border-accent shadow-xl scale-105' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    key={movie.id}
                    className="group flex flex-col cursor-pointer"
                    onClick={() => navigate(`/movies/${movie.id}/shows${selectedTheatre !== 'all' ? `?theatreId=${selectedTheatre}` : ''}`)}
                  >
                    <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-[#0a0f0c] shadow-2xl border border-white/5 group-hover:border-accent/40 transition-all duration-500">
                      <img 
                        src={movie.imageUrl || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"} 
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-transparent to-transparent opacity-60"></div>
                      
                      <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        {movie.trailerUrl && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrailer(movie.trailerUrl!);
                            }}
                            className="w-20 h-20 bg-white text-[#070b0a] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                          >
                            <Play className="w-8 h-8 ml-1 fill-current" />
                          </button>
                        )}
                      </div>

                      <div className="absolute bottom-8 left-8 right-8">
                        <span className="text-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-4 inline-block">
                          {movie.duration} Minutes
                        </span>
                        <h3 className="text-white font-cinematic text-3xl tracking-tight leading-none group-hover:text-accent transition-colors truncate">
                          {movie.title}
                        </h3>
                      </div>

                      <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl text-xs font-black text-white flex items-center gap-2 border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        <Star className="text-accent w-4 h-4 fill-accent" /> 8.5
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

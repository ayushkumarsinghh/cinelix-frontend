import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronLeft, Loader2, Star, ArrowRight } from 'lucide-react';
import axios from 'axios';

interface Show {
  id: string;
  startTime: string;
  price: number;
  theatreId: string;
  theatre: {
    name: string;
    location: string;
  };
}

interface Movie {
  id: string;
  title: string;
  imageUrl?: string;
  genre?: string;
  duration?: number;
  description?: string;
}

const MovieShows = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const theatreIdFilter = searchParams.get('theatreId');

  const [movie, setMovie] = useState<Movie | null>(null);
  const [allShows, setAllShows] = useState<Show[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate next 7 dates
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      full: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, showsRes] = await Promise.all([
          axios.get(`/api/movies/${id}`),
          axios.get(`/api/movies/${id}/shows`)
        ]);
        setMovie(movieRes.data);
        
        let fetchedShows = showsRes.data;
        
        // If no shows are returned for future dates, we generate smart showtimes
        // that follow the "no overlap + 15 min break" rule.
        if (fetchedShows.length === 0) {
          fetchedShows = [];
        }

        if (theatreIdFilter) {
          fetchedShows = fetchedShows.filter((s: Show) => s.theatreId === theatreIdFilter);
        }
        
        // Filter by selected date
        const filteredByDate = fetchedShows.filter((s: Show) => s.startTime.startsWith(selectedDate));
        setAllShows(filteredByDate);
      } catch (err) {
        console.error('Error fetching shows:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, theatreIdFilter, selectedDate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b0a]">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#070b0a] min-h-screen pb-20">
      {/* Immersive Movie Detail Banner */}
      <div className="relative w-full h-[550px] overflow-hidden border-b border-white/5">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url(${movie?.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop'})` }}
        />
        <div className="absolute inset-0 bg-[#070b0a]/80 backdrop-blur-xl md:backdrop-blur-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b0a] via-[#070b0a]/90 to-transparent hidden md:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col md:flex-row items-center gap-12 pt-24">
          <div className="hidden md:block w-[300px] aspect-[2/3] rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] flex-shrink-0 z-10 border border-white/10 relative group">
            <img 
              src={movie?.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop'} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt={movie?.title}
            />
            <div className="absolute bottom-6 left-6 right-6 flex justify-center">
               <span className="bg-accent/20 backdrop-blur-md text-accent text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] border border-accent/20">In Cinemas Now</span>
            </div>
          </div>

          <div className="flex flex-col text-white z-10 w-full">
            <button 
              onClick={() => navigate('/movies')}
              className="flex items-center gap-2 text-gray-500 hover:text-accent transition-all w-max mb-8 font-black uppercase tracking-[0.3em] text-[10px]"
            >
              <ChevronLeft className="w-4 h-4" /> Return to Catalog
            </button>

            <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-[1px] bg-accent"></div>
               <span className="text-[11px] font-bold text-accent uppercase tracking-[0.4em]">Premiere Experience</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-cinematic tracking-tight mb-8 leading-tight">{movie?.title}</h1>
            
            <div className="flex flex-wrap items-center gap-8 mb-12">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4">
                <Star className="text-accent w-5 h-5 fill-accent" />
                <div className="text-sm font-bold tracking-wide">8.5 <span className="text-gray-500 font-normal ml-1 text-[11px]">(106K Votes)</span></div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4 text-gray-300 text-[11px] font-bold uppercase tracking-[0.2em]">
                {movie?.genre || 'Action, Drama, Thriller'}
              </div>
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4 text-gray-300 text-[11px] font-bold uppercase tracking-[0.2em]">
                <Clock className="w-4 h-4 text-accent" /> {movie?.duration || 145} Minutes
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <button 
                onClick={() => document.getElementById('showtimes')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-accent text-[#070b0a] hover:bg-white font-bold py-5 px-20 rounded-full text-sm w-full md:w-max transition-all shadow-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 group"
              >
                Secure Your Seats
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                  Experience Excellence
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Bar */}
      <div className="sticky top-0 z-30 bg-[#070b0a]/60 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto py-6 scrollbar-hide">
          {availableDates.map((dateObj) => (
            <button
              key={dateObj.full}
              onClick={() => setSelectedDate(dateObj.full)}
              className={`flex flex-col items-center justify-center min-w-[90px] h-[90px] rounded-[2rem] transition-all border-2 ${
                selectedDate === dateObj.full 
                  ? 'bg-accent border-accent text-[#070b0a] shadow-2xl scale-105' 
                  : 'bg-transparent border-white/5 text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] mb-2">{dateObj.day}</span>
              <span className="text-3xl font-cinematic leading-none">{dateObj.date}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] mt-2">{dateObj.month}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-2/3">
          <h2 className="text-3xl font-cinematic text-white mb-4 tracking-tight">About the movie</h2>
          <p className="text-gray-400 text-[15px] leading-relaxed mb-12">
            {movie?.description || 'An explosion of guns and roses, betrayal and trust, and, above all, love and loss. Discover the most anticipated cinematic event of the year.'}
          </p>

          <div className="w-full h-px bg-white/5 mb-10" />

          <div className="flex items-center gap-4 mb-8">
            <h2 id="showtimes" className="text-4xl font-cinematic text-white tracking-tight">Available <span className="text-accent italic">Showtimes</span></h2>
            <div className="h-[1px] flex-1 bg-white/5 ml-4"></div>
          </div>
          
          <div className="space-y-6">
            {allShows.length > 0 ? (
              // Group shows by theatre for a cleaner BookMyShow style layout
              Array.from(new Set(allShows.map(s => s.theatreId))).map(theatreId => {
                const theatreShows = allShows.filter(s => s.theatreId === theatreId);
                const theatre = theatreShows[0].theatre;
                
                return (
                  <div key={theatreId} className="bg-[#111815]/60 backdrop-blur-3xl rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl group hover:border-accent/10 transition-all duration-500">
                    <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/30 transition-colors">
                           <MapPin className="text-accent/60 w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-cinematic text-white tracking-tight group-hover:text-accent transition-colors">{theatre.name}</h3>
                          <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-1">{theatre.location} • Premium Venue</p>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-8 text-[9px] font-bold uppercase tracking-[0.4em]">
                        <span className="flex items-center gap-2 text-gray-600"><div className="w-1.5 h-1.5 rounded-full bg-primary/30"/> Limited Seats</span>
                        <span className="flex items-center gap-2 text-accent/60"><div className="w-1.5 h-1.5 rounded-full bg-accent/40"/> Prime Selection</span>
                      </div>
                    </div>
                    
                    <div className="px-10 py-10 flex flex-wrap gap-6">
                      {theatreShows.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(show => (
                        <button 
                          key={show.id}
                          onClick={() => navigate(`/shows/${show.id}/seats`)}
                          className="group relative flex flex-col items-center bg-white/5 border border-white/10 rounded-3xl p-6 min-w-[150px] hover:bg-accent hover:border-accent transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
                        >
                          <span className="text-3xl font-cinematic text-white group-hover:text-[#070b0a] transition-colors mb-2">
                            {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] font-bold text-accent group-hover:text-[#070b0a]/60 uppercase tracking-[0.2em] transition-colors">
                             ₹{show.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-[#111815] rounded-2xl border border-white/5">
                <p className="text-gray-500">No shows available for this date.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Offers & Details */}
        <div className="w-full md:w-1/3 space-y-8">
          <div>
            <h2 className="text-3xl font-cinematic text-white mb-4 tracking-tight">Top offers for you</h2>
            <div className="space-y-4">
              <div className="bg-[#111815] border border-dashed border-accent/30 rounded-2xl p-5 cursor-pointer hover:bg-accent/5 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-2.5 rounded-xl text-accent group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6 fill-accent" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1 leading-tight">Buy 1 get 1 movie ticket free</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">Available on selected ICICI Bank Credit Cards. T&C Apply.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#111815] border border-dashed border-white/10 rounded-2xl p-5 cursor-pointer hover:bg-white/5 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="bg-white/5 p-2.5 rounded-xl text-white group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1 leading-tight">Flat ₹100 Off on Snacks</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">Valid on pre-booking combos above ₹400.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieShows;

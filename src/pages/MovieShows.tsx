import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronLeft, Loader2, Star } from 'lucide-react';
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
        if (fetchedShows.length === 0 || fetchedShows.length < 5) {
          const duration = movieRes.data.duration || 145;
          const breakTime = 15;
          const slots: Show[] = [];
          
          // Let's generate for 3 different theatres
          const mockTheatres = [
            { id: 't1', name: 'PVR: ICON, Phoenix Palladium', location: 'Mumbai' },
            { id: 't2', name: 'Inox: Insignia, Atria Mall', location: 'Mumbai' },
            { id: 't3', name: 'Cinepolis: VIP, Seawoods Grand Central', location: 'Navi Mumbai' }
          ];

          mockTheatres.forEach(theatre => {
            let currentTime = new Date(`${selectedDate}T10:00:00`);
            const endTime = new Date(`${selectedDate}T23:59:59`);

            while (currentTime < endTime) {
              slots.push({
                id: `${theatre.id}-${currentTime.getTime()}`,
                startTime: currentTime.toISOString(),
                price: 250 + (Math.floor(Math.random() * 5) * 50),
                theatreId: theatre.id,
                theatre: theatre
              });
              
              // Move to next slot: Duration + 15 min break
              currentTime = new Date(currentTime.getTime() + (duration + breakTime) * 60000);
              // Round to nearest 5 mins for cleaner times
              const minutes = currentTime.getMinutes();
              currentTime.setMinutes(minutes + (5 - (minutes % 5)) % 5);
            }
          });
          
          fetchedShows = slots;
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
      <div className="relative w-full h-[450px] md:h-[500px] border-b border-white/5">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 md:opacity-100"
          style={{ backgroundImage: `url(${movie?.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b0a] via-[#070b0a]/95 to-transparent hidden md:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-[#070b0a]/60 to-transparent md:hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-transparent to-transparent hidden md:block" />
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col md:flex-row items-end md:items-center gap-10 pt-20 md:pt-16 pb-10 md:pb-0">
          <div className="hidden md:block w-[260px] h-[390px] rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] flex-shrink-0 z-10 border border-white/10 relative transform translate-y-8">
            <img 
              src={movie?.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop'} 
              className="w-full h-full object-cover"
              alt={movie?.title}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white text-center py-2 text-xs font-bold uppercase tracking-widest border-t border-white/10">
              In Cinemas
            </div>
          </div>

          <div className="flex flex-col text-white z-10 w-full">
            <button 
              onClick={() => navigate('/movies')}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors w-max mb-6 md:mb-4"
            >
              <ChevronLeft className="w-4 h-4" /> Movies
            </button>

            <h1 className="text-4xl md:text-[44px] font-bold tracking-tight mb-4 md:mb-6 leading-none">{movie?.title}</h1>
            
            <div className="bg-[#111815]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center justify-between w-full max-w-[450px] mb-6 shadow-xl">
              <div className="flex items-center gap-3">
                <Star className="text-accent w-6 h-6 fill-accent" />
                <div>
                  <div className="font-bold text-lg leading-tight">106K+ are interested</div>
                  <div className="text-[11px] text-gray-400">Ratings & Reviews are verified</div>
                </div>
              </div>
              <button className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg text-xs font-semibold transition-colors">Rate now</button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="bg-white/10 text-white px-2.5 py-1 rounded shadow-sm text-xs font-bold border border-white/5">2D, IMAX 2D</span>
              <span className="bg-white/10 text-white px-2.5 py-1 rounded shadow-sm text-xs font-bold border border-white/5">English, Hindi</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[14px] text-gray-300 font-medium mb-8">
              <span>{movie?.duration || 145}m</span>
              <span>•</span>
              <span>{movie?.genre || 'Action, Drama, Thriller'}</span>
              <span>•</span>
              <span>UA13+</span>
              <span>•</span>
              <span>10 Apr, 2026</span>
            </div>

            <button 
              onClick={() => document.getElementById('showtimes')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-accent text-[#070b0a] hover:bg-white font-bold py-3.5 px-16 rounded-xl text-[16px] w-full md:w-max transition-all shadow-[0_0_20px_rgba(94,210,156,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              Book tickets
            </button>
          </div>
        </div>
      </div>

      {/* Date Bar */}
      <div className="sticky top-0 z-30 bg-[#070b0a]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 overflow-x-auto py-4 scrollbar-hide">
          {availableDates.map((dateObj) => (
            <button
              key={dateObj.full}
              onClick={() => setSelectedDate(dateObj.full)}
              className={`flex flex-col items-center justify-center min-w-[70px] h-[70px] rounded-xl transition-all border ${
                selectedDate === dateObj.full 
                  ? 'bg-accent border-accent text-[#070b0a] shadow-[0_0_20px_rgba(94,210,156,0.2)]' 
                  : 'bg-transparent border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">{dateObj.day}</span>
              <span className="text-xl font-black">{dateObj.date}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">{dateObj.month}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-2/3">
          <h2 className="text-[22px] font-bold text-white mb-4">About the movie</h2>
          <p className="text-gray-400 text-[15px] leading-relaxed mb-12">
            {movie?.description || 'An explosion of guns and roses, betrayal and trust, and, above all, love and loss. Discover the most anticipated cinematic event of the year.'}
          </p>

          <div className="w-full h-px bg-white/5 mb-10" />

          <h2 id="showtimes" className="text-[22px] font-bold text-white mb-6">Available Showtimes</h2>
          
          <div className="space-y-6">
            {allShows.length > 0 ? (
              // Group shows by theatre for a cleaner BookMyShow style layout
              Array.from(new Set(allShows.map(s => s.theatreId))).map(theatreId => {
                const theatreShows = allShows.filter(s => s.theatreId === theatreId);
                const theatre = theatreShows[0].theatre;
                
                return (
                  <div key={theatreId} className="bg-[#111815] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-accent w-5 h-5" />
                        <div>
                          <h3 className="text-white font-bold">{theatre.name}</h3>
                          <p className="text-gray-500 text-xs">{theatre.location} • M-Ticket Available</p>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-6 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"/> Fast Filling</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent"/> Available</span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-wrap gap-4">
                      {theatreShows.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(show => (
                        <div 
                          key={show.id}
                          onClick={() => navigate(`/shows/${show.id}/seats`)}
                          className="group relative"
                        >
                          <button className="px-6 py-3 bg-transparent border border-white/10 rounded-xl text-accent font-bold text-lg hover:bg-accent hover:text-[#070b0a] hover:border-accent transition-all min-w-[120px]">
                            {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </button>
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             ₹{show.price} • {movie?.duration || 145}m
                          </div>
                        </div>
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
            <h2 className="text-[20px] font-bold text-white mb-4">Top offers for you</h2>
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

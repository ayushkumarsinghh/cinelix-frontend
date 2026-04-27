import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronLeft, Loader2 } from 'lucide-react';
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
}

const MovieShows = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const theatreIdFilter = searchParams.get('theatreId');

  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, showsRes] = await Promise.all([
          axios.get(`/api/movies/${id}`),
          axios.get(`/api/movies/${id}/shows`)
        ]);
        setMovie(movieRes.data);
        
        let filteredShows = showsRes.data;
        if (theatreIdFilter) {
          filteredShows = showsRes.data.filter((s: Show) => s.theatreId === theatreIdFilter);
        }
        setShows(filteredShows);
      } catch (err) {
        console.error('Error fetching shows:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, theatreIdFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate('/movies')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" /> Back to Movies
      </button>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/3">
          <div className="sticky top-24">
            <img 
              src={movie?.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop'} 
              alt={movie?.title}
              className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl"
            />
            <h1 className="text-4xl font-bold text-white mt-6">{movie?.title}</h1>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <h2 className="text-2xl font-bold text-white mb-8">Available Showtimes</h2>
          
          <div className="space-y-6">
            {shows.length > 0 ? (
              shows.map((show) => (
                <div 
                  key={show.id}
                  className="glass p-6 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group border border-white/5"
                  onClick={() => navigate(`/shows/${show.id}/seats`)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Clock className="text-primary w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Today</span>
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {show.theatre.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 uppercase tracking-widest">Starting from</p>
                        <p className="text-2xl font-bold text-primary">₹{show.price}</p>
                      </div>
                      <button className="bg-white text-black px-6 py-3 rounded-xl font-bold group-hover:bg-primary group-hover:text-white transition-all">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 glass rounded-2xl">
                <p className="text-gray-500">No shows available for this movie today.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieShows;

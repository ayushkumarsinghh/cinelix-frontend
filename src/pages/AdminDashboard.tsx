import { useState, useEffect } from 'react';
import { LayoutDashboard, Film, Plus, Trash2, Calendar, MapPin, Loader2, Save, Armchair, CheckCircle2, AlertCircle, RefreshCw, ChevronLeft, Clock, X, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { recentMovies } from '../constants/mockMovies';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeatsLoading, setIsSeatsLoading] = useState(false);
  const [selectedShow, setSelectedShow] = useState<any>(null);
  const [showSeats, setShowSeats] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingMovie, setEditingMovie] = useState<any>(null);
  const [selectedTheatreFilter, setSelectedTheatreFilter] = useState('all');
  const [message, setMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const filteredShows = selectedTheatreFilter === 'all' 
    ? shows 
    : shows.filter(s => s.theatreId === selectedTheatreFilter);

  // Form States
  const [newMovie, setNewMovie] = useState({
    title: '',
    duration: 120,
    genre: '',
    description: '',
    imageUrl: '',
    backdropUrl: '',
    trailerUrl: ''
  });

  const [newTheatre, setNewTheatre] = useState({
    name: '',
    location: ''
  });

  const [newShow, setNewShow] = useState({
    movieId: '',
    theatreId: '',
    startTime: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [moviesRes, showsRes, theatresRes, statsRes] = await Promise.all([
        axios.get('/api/movies'),
        axios.get('/api/shows', { headers }),
        axios.get('/api/theatres'),
        axios.get('/api/admin/stats', { headers })
      ]);

      setMovies(moviesRes.data);
      setShows(showsRes.data);
      setTheatres(theatresRes.data);
      setStats(statsRes.data);
      
      // Auto-select first movie and theatre for the show form
      if (moviesRes.data.length > 0 && !newShow.movieId) {
        setNewShow(prev => ({ ...prev, movieId: moviesRes.data[0].id }));
      }
      if (theatresRes.data.length > 0 && !newShow.theatreId) {
        setNewShow(prev => ({ ...prev, theatreId: theatresRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (movies.length === 0 || theatres.length === 0) {
        setError('Add movies and theatres first!');
        return;
      }

      const showTimes = [11, 15, 18, 21]; 
      let createdCount = 0;

      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        for (const theatre of theatres) {
          for (let j = 0; j < showTimes.length; j++) {
            const hour = showTimes[j];
            const movieIdx = (i + j + theatres.indexOf(theatre)) % movies.length;
            const startTime = new Date(new Date(date).setHours(hour, 0, 0, 0));
            
            await axios.post('/api/shows', {
              movieId: movies[movieIdx].id,
              theatreId: theatre.id,
              startTime: startTime.toISOString(),
              price: hour >= 18 ? 450 : 300
            }, { headers });
            createdCount++;
          }
        }
      }

      setMessage(`Generated ${createdCount} shows for the next 7 days!`);
      fetchData();
    } catch (err) {
      console.error('Schedule gen error:', err);
      setError('Error generating schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/theatres', newTheatre, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Theatre added successfully!');
      setNewTheatre({ name: '', location: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add theatre.');
    }
  };

  const handleDeleteTheatre = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this theatre? All shows and seats will be removed.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/theatres/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Theatre deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Failed to delete theatre:', err);
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/movies', newMovie, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Movie added successfully!');
      setNewMovie({ title: '', duration: 120, genre: '', description: '', imageUrl: '', backdropUrl: '', trailerUrl: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add movie.');
    }
  };

  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/movies/${editingMovie.id}`, editingMovie, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Movie updated successfully!');
      setEditingMovie(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update movie.');
    }
  };

  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/shows', newShow, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Show scheduled successfully!');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add show.');
    }
  };

  const handleGenerateSampleShows = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (movies.length === 0 || theatres.length === 0) {
        setError('Please sync movies and theatres first.');
        return;
      }

      // We'll generate 4 shows for the first 3 movies in each theatre for today
      let createdCount = 0;
      const today = new Date().toISOString().split('T')[0];
      
      for (const theatre of theatres) {
        const movieSubset = movies.slice(0, 3);
        let currentHour = 10;
        
        for (const movie of movieSubset) {
          const showData = {
            movieId: movie.id,
            theatreId: theatre.id,
            startTime: `${today}T${currentHour.toString().padStart(2, '0')}:00:00Z`
          };
          await axios.post('/api/shows', showData, { headers });
          createdCount++;
          currentHour += 4; // Space them out
        }
      }
      
      setMessage(`Successfully generated ${createdCount} sample shows for today!`);
      fetchData();
    } catch (err) {
      setError('Error generating sample shows.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this movie? This will also delete all associated shows.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Movie deleted successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to delete movie.');
    }
  };

  const handleManageSeats = async (show: any) => {
    setSelectedShow(show);
    setIsSeatsLoading(true);
    try {
      const res = await axios.get(`/api/shows/${show.id}/seats`);
      setShowSeats(res.data);
    } catch (err) {
      console.error('Error fetching seats:', err);
    } finally {
      setIsSeatsLoading(false);
    }
  };

  const toggleSeatStatus = async (seat: any) => {
    try {
      const token = localStorage.getItem('token');
      if (seat.isBooked) {
        if (!window.confirm(`Seat ${seat.seatNumber} is currently blocked/booked. Do you want to UNBLOCK it?`)) return;
        
        if (seat.bookingId) {
          await axios.delete(`/api/bookings/${seat.bookingId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          handleManageSeats(selectedShow);
        } else {
          alert('This seat is temporarily locked by a user. Please wait a few minutes for the lock to expire.');
        }
      } else {
        await axios.post('/api/payment/verify', {
          showId: selectedShow.id,
          seatIds: [seat.id],
          razorpay_payment_id: 'ADMIN_BLOCK',
          razorpay_order_id: 'ADMIN_BLOCK',
          razorpay_signature: 'ADMIN_BLOCK'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        handleManageSeats(selectedShow); 
      }
    } catch (err) {
      alert('Failed to toggle seat status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
            <LayoutDashboard className="text-accent w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">Admin <span className="text-accent">Console</span></h1>
            <p className="text-gray-500 font-medium">Manage your cinema operations</p>
          </div>
        </div>

        {selectedShow && (
          <button 
            onClick={() => setSelectedShow(null)}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2 border border-white/5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        )}
      </div>

      {!selectedShow && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-[#111815] p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-accent/30 transition-all">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-bl-[2rem] flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-accent opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] mb-2 font-black italic">Revenue</p>
            <h4 className="text-2xl font-black text-accent italic tracking-tighter">₹{stats.totalRevenue.toLocaleString()}</h4>
          </div>
          <div className="bg-[#111815] p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-accent/30 transition-all">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-[2rem] flex items-center justify-center">
              <Plus className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
            </div>
            <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] mb-2 font-black italic">Admissions</p>
            <h4 className="text-2xl font-black text-white italic tracking-tighter">{stats.totalTickets}</h4>
          </div>
          <div className="bg-[#111815] p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-accent/30 transition-all">
            <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] mb-2 font-black italic">Catalog</p>
            <h4 className="text-2xl font-black text-white italic tracking-tighter">{stats.totalMovies}</h4>
          </div>
          <div className="bg-[#111815] p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-accent/30 transition-all">
            <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] mb-2 font-black italic">Screens</p>
            <h4 className="text-2xl font-black text-white italic tracking-tighter">{stats.totalTheatres}</h4>
          </div>
          <div className="bg-accent p-6 rounded-[2rem] border border-accent shadow-[0_20px_40px_-10px_rgba(94,210,156,0.3)] col-span-2 md:col-span-1 lg:col-span-1 transform hover:-rotate-1 transition-transform">
            <p className="text-[9px] text-[#070b0a] uppercase tracking-[0.3em] mb-1 font-black italic opacity-60">Trending Now</p>
            <h4 className="text-base font-black text-[#070b0a] truncate uppercase italic leading-none">{stats.mostPopularMovie}</h4>
          </div>
        </div>
      )}
      
      {(message || error) && (
        <div className="fixed bottom-10 right-10 z-[100] max-w-md w-full animate-in slide-in-from-right-4 duration-300">
          {message && (
            <div className="p-5 bg-accent text-[#070b0a] rounded-2xl flex items-center gap-3 font-bold shadow-2xl shadow-accent/20">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              {message}
            </div>
          )}
          {error && (
            <div className="p-5 bg-primary text-white rounded-2xl flex items-center gap-3 font-bold shadow-2xl shadow-primary/20">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}

      {!selectedShow ? (
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-72 space-y-3">
            <button 
              onClick={() => setActiveTab('movies')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all border ${activeTab === 'movies' ? 'bg-accent border-accent text-[#070b0a] shadow-xl shadow-accent/10' : 'text-gray-500 border-transparent hover:bg-white/5 hover:text-white'}`}
            >
              <Film className="w-5 h-5" /> Movies
            </button>
            <button 
              onClick={() => setActiveTab('shows')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all border ${activeTab === 'shows' ? 'bg-accent border-accent text-[#070b0a] shadow-xl shadow-accent/10' : 'text-gray-500 border-transparent hover:bg-white/5 hover:text-white'}`}
            >
              <Calendar className="w-5 h-5" /> Shows
            </button>
            <button 
              onClick={() => setActiveTab('theatres')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all border ${activeTab === 'theatres' ? 'bg-accent border-accent text-[#070b0a] shadow-xl shadow-accent/10' : 'text-gray-500 border-transparent hover:bg-white/5 hover:text-white'}`}
            >
              <MapPin className="w-5 h-5" /> Theatres
            </button>
            <button 
              onClick={() => setActiveTab('offers')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all border ${activeTab === 'offers' ? 'bg-accent border-accent text-[#070b0a] shadow-xl shadow-accent/10' : 'text-gray-500 border-transparent hover:bg-white/5 hover:text-white'}`}
            >
              <Sparkles className="w-5 h-5" /> Offers
            </button>
          </div>

          <div className="flex-1 space-y-10">
            {activeTab === 'movies' && (
              <div className="space-y-10 animate-fade-in">
                <div className="bg-[#111815] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                  <h2 className="text-2xl font-cinematic text-white uppercase tracking-wider">Register New Movie</h2>
                  <form onSubmit={handleAddMovie} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Title</label>
                      <input 
                        type="text" 
                        required
                        value={newMovie.title}
                        onChange={e => setNewMovie({...newMovie, title: e.target.value})}
                        className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-3 px-5 text-gray-200 focus:outline-none focus:border-accent focus:bg-[#0c1210] transition-all font-medium placeholder-gray-800 shadow-inner" 
                        placeholder="e.g. DUNE: PART TWO"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Duration (mins)</label>
                      <input 
                        type="number" 
                        required
                        value={newMovie.duration}
                        onChange={e => setNewMovie({...newMovie, duration: parseInt(e.target.value)})}
                        className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-3 px-5 text-gray-200 focus:outline-none focus:border-accent focus:bg-[#0c1210] transition-all font-medium shadow-inner" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Genre</label>
                      <input 
                        type="text" 
                        required
                        value={newMovie.genre}
                        onChange={e => setNewMovie({...newMovie, genre: e.target.value})}
                        className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-3 px-5 text-gray-200 focus:outline-none focus:border-accent focus:bg-[#0c1210] transition-all font-medium placeholder-gray-800 shadow-inner" 
                        placeholder="e.g. Action, Sci-Fi"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Poster URL (w500)</label>
                      <input 
                        type="text" 
                        required
                        value={newMovie.imageUrl}
                        onChange={e => setNewMovie({...newMovie, imageUrl: e.target.value})}
                        className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-3 px-5 text-gray-200 focus:outline-none focus:border-accent focus:bg-[#0c1210] transition-all font-medium placeholder-gray-800 shadow-inner" 
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Backdrop URL (Original)</label>
                      <input 
                        type="text" 
                        required
                        value={newMovie.backdropUrl || ''}
                        onChange={e => setNewMovie({...newMovie, backdropUrl: e.target.value})}
                        className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-3 px-5 text-gray-200 focus:outline-none focus:border-accent focus:bg-[#0c1210] transition-all font-medium placeholder-gray-800 shadow-inner" 
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Trailer URL (YouTube)</label>
                      <input 
                        type="text" 
                        required
                        value={newMovie.trailerUrl}
                        onChange={e => setNewMovie({...newMovie, trailerUrl: e.target.value})}
                        className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-3 px-5 text-gray-200 focus:outline-none focus:border-accent focus:bg-[#0c1210] transition-all font-medium placeholder-gray-800 shadow-inner" 
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Description</label>
                      <textarea 
                        required
                        value={newMovie.description}
                        onChange={e => setNewMovie({...newMovie, description: e.target.value})}
                        className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-3 px-5 text-gray-200 focus:outline-none focus:border-accent focus:bg-[#0c1210] transition-all font-medium h-24 placeholder-gray-800 shadow-inner resize-none" 
                        placeholder="Brief movie description..."
                      />
                    </div>
                    <div className="col-span-2 flex justify-end mt-2">
                      <button type="submit" className="bg-accent hover:bg-white text-[#070b0a] px-10 py-3.5 rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl shadow-accent/10 uppercase italic tracking-tighter">
                        <Save className="w-5 h-5" /> Save Movie
                      </button>
                    </div>
                  </form>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] italic">Current Inventory</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin w-10 h-10 text-accent" /></div>
                  ) : movies.length === 0 ? (
                    <div className="bg-[#111815] p-12 rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                      <Film className="w-16 h-16 text-gray-800 mb-6" />
                      <h4 className="text-xl font-bold text-white uppercase tracking-wider mb-2">No Movies Found</h4>
                      <p className="text-gray-500 font-bold max-w-xs mb-8 text-sm">Your movie library is currently empty. Start by adding a movie manually using the form above.</p>
                    </div>
                  ) : (
                    movies.map(movie => (
                      <div key={movie.id} className="group relative bg-[#111815] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-accent/40 transition-all duration-500 shadow-2xl hover:-translate-y-2">
                        <div className="aspect-[16/9] relative overflow-hidden">
                          <img 
                            src={movie.imageUrl} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt={movie.title} 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111815] via-transparent to-transparent opacity-60"></div>
                          
                          <div className="absolute top-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <button 
                              onClick={() => setEditingMovie(movie)}
                              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-accent hover:text-[#070b0a] transition-all"
                              title="Edit Movie"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteMovie(movie.id)}
                              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-all"
                              title="Delete Movie"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="absolute bottom-4 left-6">
                            <span className="bg-accent/20 backdrop-blur-md text-accent text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-[0.2em] border border-accent/20">
                              {movie.duration} Mins
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="font-black text-white text-lg uppercase tracking-tighter italic mb-1 group-hover:text-accent transition-colors truncate">
                            {movie.title}
                          </h3>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
                            {movie.genre}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'offers' && (
              <div className="space-y-10 animate-fade-in">
                <div className="bg-[#111815] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider">Active Promotions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { code: 'CINELIX50', desc: '50% OFF for First Timers', usage: 142 },
                      { code: 'WEEKEND100', desc: '₹100 OFF on Weekends', usage: 89 },
                      { code: 'BOI20', desc: '20% OFF with BOI Cards', usage: 34 }
                    ].map(promo => (
                      <div key={promo.code} className="bg-[#070b0a] p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-accent/30 transition-all">
                        <div>
                          <p className="text-accent font-bold tracking-widest uppercase">{promo.code}</p>
                          <p className="text-sm text-gray-500 font-bold">{promo.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-white">{promo.usage}</p>
                          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Redeemed</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-accent/5 p-12 rounded-[3rem] border border-accent/10 text-center">
                  <Sparkles className="w-12 h-12 text-accent mx-auto mb-6" />
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Want more deals?</h3>
                  <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">The automated campaign manager is coming soon. You'll be able to create dynamic discounts based on user behavior.</p>
                  <button className="bg-accent text-[#070b0a] px-10 py-4 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-white transition-all shadow-xl shadow-accent/20">
                    Coming Soon
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'shows' && (
              <div className="space-y-10 animate-fade-in">
                {/* Schedule New Show Form */}
                <div className="bg-[#111815] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-8">Schedule New Show</h2>
                  <form onSubmit={handleAddShow} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Select Movie</label>
                      <select 
                        required
                        value={newShow.movieId}
                        onChange={e => setNewShow({...newShow, movieId: e.target.value})}
                        className="w-full bg-[#070b0a] border border-white/5 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-accent transition-all font-bold shadow-inner cursor-pointer"
                      >
                        <option value="">Select a movie</option>
                        {movies.map(m => <option key={m.id} value={m.id} className="bg-black">{m.title}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Select Theatre</label>
                      <select 
                        required
                        value={newShow.theatreId}
                        onChange={e => setNewShow({...newShow, theatreId: e.target.value})}
                        className="w-full bg-[#070b0a] border border-white/5 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-accent transition-all font-bold shadow-inner cursor-pointer"
                      >
                        <option value="">Select a theatre</option>
                        {theatres.map(t => <option key={t.id} value={t.id} className="bg-black">{t.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3 col-span-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Start Date & Time</label>
                      <input 
                        type="datetime-local" 
                        required
                        value={newShow.startTime}
                        onChange={e => setNewShow({...newShow, startTime: e.target.value})}
                        onClick={(e) => (e.target as any).showPicker?.()}
                        className="w-full bg-[#070b0a] border border-white/5 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-accent transition-all font-bold shadow-inner cursor-pointer"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end mt-4">
                      <button type="submit" className="bg-accent hover:bg-white text-[#070b0a] px-12 py-4 rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl shadow-accent/10 uppercase italic tracking-tighter">
                        <Plus className="w-5 h-5" /> Schedule Show
                      </button>
                    </div>
                  </form>
                </div>

                {/* Show Listings Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] italic">Show Listings</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Filter:</label>
                    <select 
                      value={selectedTheatreFilter}
                      onChange={e => setSelectedTheatreFilter(e.target.value)}
                      className="bg-[#111815] border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-accent"
                    >
                      <option value="all" className="bg-black">All Theatres</option>
                      {theatres.map(t => <option key={t.id} value={t.id} className="bg-black">{t.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Show Cards */}
                <div className="grid grid-cols-1 gap-4">
                  {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin w-10 h-10 text-accent" /></div>
                  ) : filteredShows.length > 0 ? (
                    filteredShows.map(show => (
                      <div key={show.id} className="bg-[#111815] p-6 rounded-[2rem] flex items-center justify-between border border-white/5 shadow-xl hover:border-accent/30 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center text-accent">
                            <Calendar className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="font-black text-white text-lg uppercase italic tracking-tight">{show.movie.title}</h3>
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mt-1">
                              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {show.theatre.name}</span>
                              <span className="text-white/60">{new Date(show.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleManageSeats(show)}
                          className="px-8 py-3 bg-white/5 hover:bg-accent hover:text-[#070b0a] text-white rounded-2xl text-xs font-black transition-all uppercase italic tracking-widest border border-white/10 hover:border-accent"
                        >
                          Manage Seats
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-24 bg-[#111815] rounded-[2.5rem] border border-dashed border-white/5">
                      <Calendar className="w-12 h-12 text-gray-800 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-500 font-bold uppercase tracking-widest">No shows found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'theatres' && (
              <div className="space-y-10 animate-fade-in">
                <div className="bg-[#111815] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase italic tracking-wider">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-accent" /></div>
                      Add New Theatre
                    </h2>
                  </div>
                  <form onSubmit={handleAddTheatre} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Theatre Name</label>
                      <input 
                        required
                        placeholder="e.g. CINELIX PRIME IMAX"
                        value={newTheatre.name}
                        onChange={e => setNewTheatre({...newTheatre, name: e.target.value})}
                        className="w-full bg-[#070b0a] border border-white/5 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-accent transition-all font-bold placeholder-gray-700 shadow-inner"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">City / Location</label>
                      <input 
                        required
                        placeholder="e.g. MUMBAI, BKC"
                        value={newTheatre.location}
                        onChange={e => setNewTheatre({...newTheatre, location: e.target.value})}
                        className="w-full bg-[#070b0a] border border-white/5 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-accent transition-all font-bold placeholder-gray-700 shadow-inner"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end mt-4">
                      <button type="submit" className="bg-accent hover:bg-white text-[#070b0a] px-12 py-4 rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl shadow-accent/10 uppercase italic tracking-tighter">
                        <Plus className="w-5 h-5" /> Add Theatre
                      </button>
                    </div>
                  </form>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] italic">Theatre Directory</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin w-10 h-10 text-accent" /></div>
                  ) : theatres.length > 0 ? (
                    theatres.map(theatre => (
                      <div key={theatre.id} className="bg-[#111815] p-6 rounded-[2rem] flex items-center justify-between border border-white/5 shadow-xl hover:border-accent/30 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center text-accent">
                            <MapPin className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="font-black text-white text-lg uppercase italic tracking-tight">{theatre.name}</h3>
                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">{theatre.location} • {theatre._count?.shows || 0} SHOWS ACTIVE • {theatre._count?.seats || 0} SEATS</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteTheatre(theatre.id)}
                          className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-gray-500 hover:text-primary transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-24 bg-[#111815] rounded-[2.5rem] border border-dashed border-white/5">
                      <MapPin className="w-12 h-12 text-gray-800 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-500 font-bold uppercase tracking-widest">No theatres found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SEAT MANAGEMENT VIEW */
        <div className="space-y-10 animate-fade-in">
          <div className="bg-[#111815] p-10 rounded-[3rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl">
            <div className="flex items-center gap-8">
              <img src={selectedShow.movie.imageUrl} className="w-28 h-40 rounded-[2rem] object-cover shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" alt="" />
              <div>
                <div className="text-accent text-xs font-black uppercase tracking-[0.4em] mb-2">Live Seat Mapping</div>
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">{selectedShow.movie.title}</h2>
                <div className="flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-widest text-gray-500">
                  <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Calendar className="w-4 h-4 text-accent" /> {new Date(selectedShow.startTime).toLocaleDateString()}</span>
                  <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Clock className="w-4 h-4 text-accent" /> {new Date(selectedShow.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><MapPin className="w-4 h-4 text-accent" /> {selectedShow.theatre.name}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
               <div className="w-32 h-32 rounded-full border-4 border-accent/20 flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="text-2xl font-black text-white italic">80%</div>
                    <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Occupancy</div>
                  </div>
                  <div className="absolute inset-0 rounded-full border-t-4 border-accent -rotate-45"></div>
               </div>
            </div>
          </div>

          <div className="bg-[#111815] p-16 rounded-[4rem] border border-white/5 flex flex-col items-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent"></div>
            
            <div className="w-full max-w-2xl bg-[#070b0a] h-12 rounded-full mb-24 relative flex items-center justify-center border border-white/5 shadow-inner">
              <div className="absolute inset-0 bg-accent/5 blur-2xl"></div>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[1em] relative z-10 ml-4">Screen This Way</p>
            </div>

            <div className="flex flex-col gap-6">
              {isSeatsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <Loader2 className="w-16 h-16 text-accent animate-spin" />
                  <p className="text-gray-500 font-black uppercase tracking-widest animate-pulse">Initializing seat map...</p>
                </div>
              ) : showSeats.length === 0 ? (
                <div className="text-center py-24 bg-[#070b0a] rounded-[3rem] border border-dashed border-white/5 w-[600px]">
                  <Armchair className="w-16 h-16 text-gray-800 mx-auto mb-6 opacity-20" />
                  <p className="text-gray-500 font-black uppercase tracking-widest">No physical layout found</p>
                </div>
              ) : (
                Object.entries(
                  showSeats.reduce((acc: any, seat: any) => {
                    if (!acc[seat.row]) acc[seat.row] = [];
                    acc[seat.row].push(seat);
                    return acc;
                  }, {})
                ).map(([rowLabel, rowSeats]: [string, any]) => (
                  <div key={rowLabel} className="flex items-center gap-10">
                    <span className="w-8 text-sm text-gray-700 font-black italic">{rowLabel}</span>
                    <div className="grid grid-cols-10 gap-4">
                      {rowSeats.sort((a: any, b: any) => a.number - b.number).map((seat: any) => (
                        <button
                          key={seat.id}
                          onClick={() => toggleSeatStatus(seat)}
                          className={`
                            group relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-500
                            ${seat.isBooked 
                              ? 'bg-primary/10 border-2 border-primary/30 text-primary shadow-[0_0_30px_rgba(229,9,20,0.15)]' 
                              : 'bg-[#111815] border border-white/5 text-gray-600'
                            }
                          `}
                        >
                          <Armchair className="w-6 h-6" />
                          <span className="text-[9px] font-black mt-1 uppercase italic tracking-tighter">{seat.seatNumber}</span>
                          {seat.isBooked && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center border-2 border-[#111815] shadow-lg">
                               <X className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <span className="w-8 text-sm text-gray-700 font-black italic text-right">{rowLabel}</span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-20 flex gap-16 border-t border-white/5 pt-12">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-lg bg-[#070b0a] border-2 border-white/5"></div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Available</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-lg bg-primary/20 border-2 border-primary/40"></div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sold / Blocked</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-lg border-2 border-accent"></div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Selected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Movie Modal */}
      {editingMovie && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
            onClick={() => setEditingMovie(null)}
          ></motion.div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a0f0d] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col md:flex-row"
          >
            {/* Left Side: Movie Poster Preview */}
            <div className="w-full md:w-72 relative overflow-hidden hidden lg:block shrink-0">
              <img 
                src={editingMovie.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop'} 
                alt={editingMovie.title}
                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0f0d]"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent"></div>
              
              <div className="absolute bottom-10 left-8 right-8">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
                   <span className="text-[9px] font-bold text-accent uppercase tracking-[0.4em]">Live Preview</span>
                </div>
                <h3 className="text-2xl font-cinematic text-white leading-tight mb-2">{editingMovie.title || 'Untitled'}</h3>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">{editingMovie.genre || 'Genre Not Set'}</p>
              </div>
            </div>

            <div className="flex-1 p-8 md:p-10 relative overflow-y-auto custom-scrollbar">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-gradient-to-r from-accent/50 via-accent to-accent/50"
                />
              </div>
            
            <button 
              onClick={() => setEditingMovie(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all border border-white/5 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0">
                <RefreshCw className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-cinematic text-white tracking-tight leading-none">Update <span className="text-accent italic">Movie Data</span></h2>
                <p className="text-[9px] text-accent/60 font-bold uppercase tracking-[0.4em] mt-2">Curating the Cinematic Experience</p>
              </div>
            </div>

            <form onSubmit={handleUpdateMovie} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Title</label>
                <input 
                  type="text" 
                  value={editingMovie.title}
                  onChange={e => setEditingMovie({...editingMovie, title: e.target.value})}
                  className="w-full bg-[#050706] border border-white/5 rounded-xl py-3 px-5 text-white focus:outline-none focus:border-accent focus:bg-black transition-all font-bold shadow-inner placeholder-gray-800 text-sm" 
                  placeholder="Cinematic Title"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Genre</label>
                <input 
                  type="text" 
                  value={editingMovie.genre}
                  onChange={e => setEditingMovie({...editingMovie, genre: e.target.value})}
                  className="w-full bg-[#050706] border border-white/5 rounded-xl py-3 px-5 text-white focus:outline-none focus:border-accent focus:bg-black transition-all font-bold shadow-inner placeholder-gray-800 text-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Duration (mins)</label>
                <input 
                  type="number" 
                  value={editingMovie.duration}
                  onChange={e => setEditingMovie({...editingMovie, duration: parseInt(e.target.value)})}
                  className="w-full bg-[#050706] border border-white/5 rounded-xl py-3 px-5 text-white focus:outline-none focus:border-accent focus:bg-black transition-all font-bold shadow-inner placeholder-gray-800 text-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Trailer URL</label>
                <input 
                  type="text" 
                  value={editingMovie.trailerUrl || ''}
                  onChange={e => setEditingMovie({...editingMovie, trailerUrl: e.target.value})}
                  className="w-full bg-[#050706] border border-white/5 rounded-xl py-3 px-5 text-white focus:outline-none focus:border-accent focus:bg-black transition-all font-bold shadow-inner placeholder-gray-800 text-sm" 
                />
              </div>
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Poster URL (w500)</label>
                <input 
                  type="text" 
                  value={editingMovie.imageUrl}
                  onChange={e => setEditingMovie({...editingMovie, imageUrl: e.target.value})}
                  className="w-full bg-[#070b0a] border border-white/5 rounded-xl py-3 px-5 text-gray-300 focus:outline-none focus:border-accent focus:bg-[#0c1210] transition-all font-medium shadow-inner text-xs" 
                />
              </div>
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Backdrop URL (Original)</label>
                <input 
                  type="text" 
                  value={editingMovie.backdropUrl || ''}
                  onChange={e => setEditingMovie({...editingMovie, backdropUrl: e.target.value})}
                  className="w-full bg-[#070b0a] border border-white/5 rounded-xl py-3 px-5 text-gray-300 focus:outline-none focus:border-accent focus:bg-[#0c1210] transition-all font-medium shadow-inner text-xs" 
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Description</label>
                <textarea 
                  value={editingMovie.description}
                  onChange={e => setEditingMovie({...editingMovie, description: e.target.value})}
                  className="w-full bg-[#050706] border border-white/5 rounded-xl py-3 px-5 text-white focus:outline-none focus:border-accent focus:bg-black transition-all font-bold h-24 shadow-inner resize-none text-sm leading-relaxed" 
                  placeholder="Narrative summary of the movie..."
                />
              </div>
              <div className="col-span-2 flex justify-end gap-4 mt-6">
                <button 
                  type="button"
                  onClick={() => setEditingMovie(null)}
                  className="px-6 py-2 rounded-lg font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest text-[9px]"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="bg-accent hover:bg-white text-[#070b0a] px-10 py-3.5 rounded-xl font-bold transition-all shadow-xl uppercase tracking-[0.2em] text-[10px]"
                >
                  Apply Changes
                </button>
              </div>
            </form>
          </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

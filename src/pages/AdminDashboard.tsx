import { useState, useEffect } from 'react';
import { LayoutDashboard, Film, Plus, Trash2, Calendar, MapPin, Loader2, Save, Armchair, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

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
    } catch (err) {
      console.error('Error fetching admin data:', err);
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
      setNewMovie({ title: '', duration: 120, genre: '', description: '', imageUrl: '', trailerUrl: '' });
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
        
        // If it's a real booking with an ID, we can delete it
        if (seat.bookingId) {
          await axios.delete(`/api/bookings/${seat.bookingId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          handleManageSeats(selectedShow);
        } else {
          alert('This seat is temporarily locked by a user. Please wait a few minutes for the lock to expire.');
        }
      } else {
        // Block the seat by creating a booking
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
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <LayoutDashboard className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your cinema operations</p>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
            <div className="glass p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 font-bold">Total Revenue</p>
              <h4 className="text-2xl font-black text-primary">₹{stats.totalRevenue}</h4>
            </div>
            <div className="glass p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 font-bold">Tickets Sold</p>
              <h4 className="text-2xl font-black text-white">{stats.totalTickets}</h4>
            </div>
            <div className="glass p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 font-bold">Total Movies</p>
              <h4 className="text-2xl font-black text-white">{stats.totalMovies}</h4>
            </div>
            <div className="glass p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 font-bold">Total Theatres</p>
              <h4 className="text-2xl font-black text-white">{stats.totalTheatres}</h4>
            </div>
            <div className="glass p-6 rounded-3xl border border-white/5 col-span-2 md:col-span-1 lg:col-span-1 bg-primary/5">
              <p className="text-[10px] text-primary uppercase tracking-[0.2em] mb-2 font-bold">Top Movie</p>
              <h4 className="text-lg font-bold text-white truncate">{stats.mostPopularMovie}</h4>
            </div>
          </div>
        )}

        {selectedShow && (
          <button 
            onClick={() => setSelectedShow(null)}
            className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2"
          >
            <Plus className="rotate-45 w-4 h-4" /> Back to Dashboard
          </button>
        )}
      </div>
      
      {(message || error) && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          {message && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500 font-medium">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              {message}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}

      {!selectedShow ? (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 space-y-2">
            <button 
              onClick={() => setActiveTab('movies')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'movies' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Film className="w-5 h-5" /> Movies
            </button>
            <button 
              onClick={() => setActiveTab('shows')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'shows' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Calendar className="w-5 h-5" /> Shows
            </button>
            <button 
              onClick={() => setActiveTab('theatres')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'theatres' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Plus className="w-5 h-5" /> Theatres
            </button>
          </div>

          <div className="flex-1 space-y-8">
            {activeTab === 'movies' && (
              <div className="space-y-8">
                <div className="glass p-8 rounded-[2rem] border border-white/5">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" /> Add New Movie
                  </h2>
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleAddMovie} className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Title</label>
                      <input 
                        type="text" 
                        value={newMovie.title}
                        onChange={e => setNewMovie({...newMovie, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                        placeholder="e.g. Inception"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Duration (mins)</label>
                      <input 
                        type="number" 
                        value={newMovie.duration}
                        onChange={e => setNewMovie({...newMovie, duration: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Genre</label>
                      <input 
                        type="text" 
                        value={newMovie.genre}
                        onChange={e => setNewMovie({...newMovie, genre: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                        placeholder="e.g. Action, Sci-Fi"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Image URL</label>
                      <input 
                        type="text" 
                        value={newMovie.imageUrl}
                        onChange={e => setNewMovie({...newMovie, imageUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trailer URL (YouTube)</label>
                      <input 
                        type="text" 
                        value={newMovie.trailerUrl}
                        onChange={e => setNewMovie({...newMovie, trailerUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
                      <textarea 
                        value={newMovie.description}
                        onChange={e => setNewMovie({...newMovie, description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 h-24" 
                        placeholder="Brief movie description..."
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
                        <Save className="w-5 h-5" /> Save Movie
                      </button>
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
                  ) : (
                    movies.map(movie => (
                      <div key={movie.id} className="glass p-4 rounded-2xl flex items-center justify-between border border-white/5">
                        <div className="flex items-center gap-4">
                          <img src={movie.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt="" />
                          <div>
                            <h3 className="font-bold text-white">{movie.title}</h3>
                            <p className="text-sm text-gray-500">{movie.genre} • {movie.duration} mins</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setEditingMovie(movie)}
                            className="p-2 text-gray-500 hover:text-primary transition-colors"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMovie(movie.id)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'shows' && (
              <div className="space-y-8">
                {/* Add Show Form */}
                <div className="glass p-8 rounded-[2rem] border border-white/5">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" /> Schedule New Show
                  </h2>
                  
                  {error && activeTab === 'shows' && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm animate-pulse">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleAddShow} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Movie</label>
                      <select 
                        value={newShow.movieId}
                        onChange={e => setNewShow({...newShow, movieId: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {movies.map(m => <option key={m.id} value={m.id} className="bg-gray-900">{m.title}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Theatre</label>
                      <select 
                        value={newShow.theatreId}
                        onChange={e => setNewShow({...newShow, theatreId: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {theatres.map(t => <option key={t.id} value={t.id} className="bg-gray-900">{t.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Start Time</label>
                      <input 
                        type="datetime-local" 
                        value={newShow.startTime}
                        onChange={e => setNewShow({...newShow, startTime: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                      <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Schedule Show
                      </button>
                    </div>
                  </form>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" /> Scheduled Shows
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase">Filter By Theatre:</span>
                    <select 
                      value={selectedTheatreFilter}
                      onChange={e => setSelectedTheatreFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="all" className="bg-gray-900">All Theatres</option>
                      {theatres.map(t => <option key={t.id} value={t.id} className="bg-gray-900">{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
                  ) : filteredShows.length > 0 ? (
                    filteredShows.map(show => (
                      <div key={show.id} className="glass p-6 rounded-2xl flex items-center justify-between border border-white/5">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                            <Calendar className="text-primary w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{show.movie.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {show.theatre.name}</span>
                              <span>{new Date(show.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleManageSeats(show)}
                          className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                          Manage Seats
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-24 glass rounded-3xl border border-dashed border-white/10">
                      <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-500">No shows found. Use the form above to schedule one!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'theatres' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="glass p-8 rounded-[2rem] border border-white/5">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" /> Add New Theatre
                  </h2>
                  <form onSubmit={handleAddTheatre} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Name</label>
                      <input 
                        required
                        placeholder="e.g. IMAX Megaplex"
                        value={newTheatre.name}
                        onChange={e => setNewTheatre({...newTheatre, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Location</label>
                      <input 
                        required
                        placeholder="e.g. Mumbai, BKC"
                        value={newTheatre.location}
                        onChange={e => setNewTheatre({...newTheatre, location: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5" /> Add Theatre
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
                  ) : theatres.length > 0 ? (
                    theatres.map(theatre => (
                      <div key={theatre.id} className="glass p-6 rounded-2xl flex items-center justify-between border border-white/5">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                            <MapPin className="text-primary w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{theatre.name}</h3>
                            <p className="text-sm text-gray-500">{theatre.location} • {theatre._count?.shows || 0} shows scheduled</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteTheatre(theatre.id)}
                          className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-24 glass rounded-3xl border border-dashed border-white/10">
                      <MapPin className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-500">No theatres found. Start by adding one!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <img src={selectedShow.movie.imageUrl} className="w-24 h-32 rounded-2xl object-cover shadow-2xl" alt="" />
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedShow.movie.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-gray-400">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {new Date(selectedShow.startTime).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {selectedShow.theatre.name}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-500 text-xs font-bold uppercase">Live Management</span>
              </div>
            </div>
          </div>

          <div className="glass p-12 rounded-[3rem] border border-white/5 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white/5 h-2 rounded-full mb-16 relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-primary/20 blur-md"></div>
              <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 uppercase tracking-[0.5em]">Screen</p>
            </div>

            <div className="flex flex-col gap-4">
              {isSeatsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-gray-500 animate-pulse">Fetching seat map...</p>
                </div>
              ) : showSeats.length === 0 ? (
                <div className="text-center py-24 glass rounded-[2rem] border border-dashed border-white/10">
                  <Armchair className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-20" />
                  <p className="text-gray-500 font-medium">No seats found in database.</p>
                  <p className="text-xs text-gray-600 mt-2">Try running "npx prisma db seed" to fix this.</p>
                </div>
              ) : Object.entries(
                showSeats.reduce((acc: any, seat: any) => {
                  if (!acc[seat.row]) acc[seat.row] = [];
                  acc[seat.row].push(seat);
                  return acc;
                }, {})
              ).map(([rowLabel, rowSeats]: [string, any]) => (
                <div key={rowLabel} className="flex items-center gap-6">
                  <span className="w-6 text-xs text-gray-600 font-bold">{rowLabel}</span>
                  <div className="grid grid-cols-10 gap-3">
                    {rowSeats.sort((a: any, b: any) => a.number - b.number).map((seat: any) => (
                      <button
                        key={seat.id}
                        onClick={() => toggleSeatStatus(seat)}
                        className={`
                          group relative w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all duration-300
                          ${seat.isBooked 
                            ? 'bg-red-500/20 border border-red-500/40 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:border-primary/50 hover:text-primary'}
                        `}
                      >
                        <Armchair className={`w-4 h-4 ${seat.isBooked ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        <span className="text-[8px] font-bold mt-0.5">{seat.seatNumber}</span>
                        {seat.isBooked && <AlertCircle className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white rounded-full p-0.5" />}
                      </button>
                    ))}
                  </div>
                  <span className="w-6 text-xs text-gray-600 font-bold text-right">{rowLabel}</span>
                </div>
              ))}
            </div>

            <div className="mt-16 flex gap-12 border-t border-white/5 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md bg-white/5 border border-white/10"></div>
                <span className="text-xs text-gray-500">Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md bg-red-500/20 border border-red-500/40"></div>
                <span className="text-xs text-gray-500">Booked/Blocked</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Movie Modal */}
      {editingMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingMovie(null)}></div>
          <div className="relative w-full max-w-2xl glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Movie</h2>
            <form onSubmit={handleUpdateMovie} className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Title</label>
                <input 
                  type="text" 
                  value={editingMovie.title}
                  onChange={e => setEditingMovie({...editingMovie, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Genre</label>
                <input 
                  type="text" 
                  value={editingMovie.genre}
                  onChange={e => setEditingMovie({...editingMovie, genre: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Duration (mins)</label>
                <input 
                  type="number" 
                  value={editingMovie.duration}
                  onChange={e => setEditingMovie({...editingMovie, duration: parseInt(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trailer URL</label>
                <input 
                  type="text" 
                  value={editingMovie.trailerUrl || ''}
                  onChange={e => setEditingMovie({...editingMovie, trailerUrl: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Image URL</label>
                <input 
                  type="text" 
                  value={editingMovie.imageUrl}
                  onChange={e => setEditingMovie({...editingMovie, imageUrl: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
                <textarea 
                  value={editingMovie.description}
                  onChange={e => setEditingMovie({...editingMovie, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 h-24" 
                />
              </div>
              <div className="col-span-2 flex justify-end gap-4 mt-4">
                <button 
                  type="button"
                  onClick={() => setEditingMovie(null)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                >
                  Update Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

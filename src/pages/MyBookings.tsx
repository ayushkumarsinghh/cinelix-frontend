import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, Loader2, ChevronRight, Armchair, X, QrCode } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  show: {
    startTime: string;
    theatre: {
      name: string;
    };
    movie: {
      title: string;
      imageUrl?: string;
    };
  };
  seats: {
    id: string;
    row: string;
    number: number;
  }[];
}

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/bookings/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Ticket className="text-primary w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-white">My Bookings</h1>
      </div>

      <div className="space-y-6">
        {bookings.filter(b => b?.show?.movie && b?.show?.theatre).length > 0 ? (
          bookings.filter(b => b?.show?.movie && b?.show?.theatre).map((booking) => (
            <div key={booking.id} className="glass rounded-3xl overflow-hidden border border-white/5 group hover:border-primary/30 transition-all">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-64 aspect-[3/4] md:aspect-auto relative overflow-hidden">
                  <img 
                    src={booking.show?.movie?.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop'} 
                    alt={booking.show?.movie?.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className={booking.status === 'CONFIRMED' ? 'bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider' : 'bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider'}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-8">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{booking.show?.movie?.title}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {booking.show ? new Date(booking.show.startTime).toLocaleDateString() : 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {booking.show?.theatre?.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                      <p className="text-xs font-mono text-gray-400">{booking.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Time</p>
                      <p className="text-lg font-bold text-white">
                        {booking.show ? new Date(booking.show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Seats</p>
                      <div className="flex flex-wrap gap-1">
                        {booking.seats?.map((seat, index) => (
                          <span key={seat.id} className="text-lg font-bold text-white">
                            {seat.row}{seat.number}{index < (booking.seats?.length || 0) - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Paid</p>
                      <p className="text-lg font-bold text-primary">₹{booking.totalAmount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Armchair className="w-4 h-4" />
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => setSelectedBooking(booking)}
                      className="flex items-center gap-2 text-sm font-bold text-white hover:text-primary transition-colors"
                    >
                      View QR Ticket <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-32 glass rounded-3xl border border-dashed border-white/10">
            <Ticket className="w-16 h-16 text-gray-700 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't booked any movies yet. Explore the latest movies and start your journey.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
            >
              Explore Movies
            </button>
          </div>
        )}
      </div>

      {/* Digital Ticket Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#1a1a1a] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedBooking(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="p-8 pb-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Digital Ticket</span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4 leading-tight">{selectedBooking.show?.movie?.title}</h3>
                
                <div className="grid grid-cols-2 gap-y-6 mb-8">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-bold text-white">{selectedBooking.show ? new Date(selectedBooking.show.startTime).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Time</p>
                    <p className="text-sm font-bold text-white">{selectedBooking.show ? new Date(selectedBooking.show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Seats</p>
                    <p className="text-sm font-bold text-white">
                      {selectedBooking.seats?.map(s => `${s.row}${s.number}`).join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cinema</p>
                    <p className="text-sm font-bold text-white">{selectedBooking.show?.theatre?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Decorative Perforated Line */}
              <div className="relative h-6 flex items-center">
                <div className="absolute left-0 -translate-x-1/2 w-6 h-6 bg-black rounded-full border-r border-white/10"></div>
                <div className="flex-1 border-t-2 border-dashed border-white/10 mx-6"></div>
                <div className="absolute right-0 translate-x-1/2 w-6 h-6 bg-black rounded-full border-l border-white/10"></div>
              </div>

              <div className="p-8 pt-6 flex flex-col items-center">
                <div className="p-4 bg-white rounded-3xl mb-6 shadow-lg">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/verify/${selectedBooking.id}`} 
                    alt="Booking QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-center text-xs text-gray-500 max-w-[200px]">
                  Scan this code at the cinema entrance to enter the theatre.
                </p>
              </div>
              
              <div className="bg-primary p-4 text-center">
                <p className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Enjoy the Movie</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookings;

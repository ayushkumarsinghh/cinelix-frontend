import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Calendar, MapPin, Film, Armchair, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const VerifyTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`/api/bookings/verify/${id}`);
        if (!response.data) {
          setError('Ticket not found or invalid.');
        } else {
          setBooking(response.data);
        }
      } catch (err) {
        setError('Failed to verify ticket. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleRedeem = async () => {
    try {
      await axios.post(`/api/bookings/redeem/${id}`);
      setBooking({ ...booking, isUsed: true });
    } catch (err) {
      setError('Failed to redeem ticket.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b0a] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Verifying Ticket Authenticity...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b0a] py-20 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>

      <div className="max-w-xl mx-auto relative z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-10 rounded-[2.5rem] text-center border border-primary/20"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-cinematic text-white mb-2 tracking-tight">Invalid Ticket</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all w-full"
            >
              Back to Movies
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-[3rem] overflow-hidden border shadow-2xl transition-all duration-500 ${
              booking.isUsed ? 'border-accent/50' : 'border-white/10'
            }`}
          >
            {(() => {
              const startTime = new Date(booking.show.startTime).getTime();
              const durationMs = booking.show.movie.duration * 60 * 1000;
              const endTime = startTime + durationMs;
              const isCompleted = Date.now() > endTime;

              if (isCompleted) {
                return (
                  <div className="bg-primary/10 p-8 text-center border-b border-white/5">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-cinematic text-white uppercase tracking-wider">Show Ended</h1>
                    <p className="text-primary/80 text-sm font-bold uppercase tracking-[0.2em] mt-1">Ticket Expired</p>
                  </div>
                );
              }

              return (
                <div className={`${booking.isUsed ? 'bg-accent/10' : 'bg-emerald-500/10'} p-8 text-center border-b border-white/5`}>
                  <div className={`w-16 h-16 ${booking.isUsed ? 'bg-accent/20' : 'bg-emerald-500/20'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    {booking.isUsed ? <XCircle className="w-8 h-8 text-accent" /> : <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                  </div>
                  <h1 className="text-3xl font-cinematic text-white uppercase tracking-wider">
                    {booking.isUsed ? 'Ticket Void' : 'Ticket Verified'}
                  </h1>
                  <p className={`${booking.isUsed ? 'text-accent/80' : 'text-emerald-500/80'} text-sm font-bold uppercase tracking-[0.2em] mt-1`}>
                    {booking.isUsed ? 'Already Checked-In' : 'Authentic Access'}
                  </p>
                </div>
              );
            })()}

            <div className="p-10">
              {/* Movie Info */}
              <div className="flex gap-6 mb-10 pb-10 border-b border-white/5">
                <div className="w-24 h-32 rounded-2xl overflow-hidden shadow-xl border border-white/10">
                  <img 
                    src={booking.show.movie.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop'} 
                    alt={booking.show.movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 py-2">
                  <h2 className="text-2xl font-cinematic text-white mb-2">{booking.show.movie.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Film className="w-3 h-3" /> {booking.show.movie.duration}m</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      booking.isUsed ? 'bg-accent/20 text-accent' : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {booking.isUsed ? 'Redeemed' : 'Valid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Show Details */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Calendar className="w-3 h-3 text-primary" /> Date & Time
                  </p>
                  <p className="text-white font-bold">
                    {new Date(booking.show.startTime).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {new Date(booking.show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <MapPin className="w-3 h-3 text-primary" /> Cinema
                  </p>
                  <p className="text-white font-bold leading-tight">
                    {booking.show.theatre.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {booking.show.theatre.location}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Armchair className="w-3 h-3 text-primary" /> Seat Number
                  </p>
                  <p className="text-3xl font-black text-white">
                    {booking.seat.seatNumber}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {(() => {
                const startTime = new Date(booking.show.startTime).getTime();
                const durationMs = booking.show.movie.duration * 60 * 1000;
                const endTime = startTime + durationMs;
                const isCompleted = Date.now() > endTime;

                if (isCompleted) {
                  return (
                    <div className="w-full bg-primary/10 text-primary py-4 rounded-2xl font-bold text-center border border-primary/10 mb-6">
                      Show Completed - Access Denied
                    </div>
                  );
                }

                if (!booking.isUsed) {
                  return (
                    <button 
                      onClick={handleRedeem}
                      className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 transform hover:scale-[1.02] active:scale-[0.98] mb-6"
                    >
                      Confirm Check-In
                    </button>
                  );
                }

                return (
                  <div className="w-full bg-white/5 text-gray-500 py-4 rounded-2xl font-bold text-center border border-white/5 mb-6">
                    Check-In Completed
                  </div>
                );
              })()}

              {/* User Info */}
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Registered to</p>
                <p className="text-white font-medium">{booking.userEmail}</p>
              </div>
            </div>

            <div className={`${booking.isUsed ? 'bg-accent' : 'bg-primary'} p-4 text-center transition-colors`}>
              <p className="text-[10px] font-black text-black uppercase tracking-[0.4em]">
                {booking.isUsed ? 'Access Revoked' : 'Verified by Cinelix'}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VerifyTicket;

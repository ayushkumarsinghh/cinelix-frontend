import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Armchair, Info } from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { io } from 'socket.io-client';

const socket = io(window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
}

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocking, setIsLocking] = useState(false);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await axios.get(`/api/shows/${id}/seats`);
        setSeats(response.data);
      } catch (err) {
        console.error('Error fetching seats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeats();

    // Socket listeners
    socket.emit('join_show', id);

    socket.on('seat_update', ({ lockedSeats }) => {
      setSeats(prev => prev.map(seat => 
        lockedSeats.includes(seat.id) ? { ...seat, status: 'LOCKED' } : seat
      ));
    });

    socket.on('booking_confirmed', ({ confirmedSeats }) => {
      setSeats(prev => prev.map(seat => 
        confirmedSeats.includes(seat.id) ? { ...seat, status: 'BOOKED' } : seat
      ));
    });

    return () => {
      socket.off('seat_update');
      socket.off('booking_confirmed');
    };
  }, [id]);

  const toggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleProceed = async () => {
    if (selectedSeats.length === 0) return;
    
    setIsLocking(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post('/api/seats/lock', {
        showId: id,
        seatIds: selectedSeats
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/checkout', { state: { showId: id, seatIds: selectedSeats } });
    } catch (err) {
      console.error('Error locking seats:', err);
      alert('Failed to lock seats. Some seats might have been taken.');
    } finally {
      setIsLocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Organize seats into rows
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Change Show
        </button>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 bg-white/10 rounded-sm border border-white/10"></div> Available
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 bg-primary rounded-sm shadow-sm shadow-primary/20"></div> Selected
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 bg-gray-800 rounded-sm"></div> Occupied
          </div>
        </div>
      </div>

      {/* Screen */}
      <div className="relative mb-20">
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full shadow-[0_-10px_20px_rgba(229,9,20,0.3)]"></div>
        <p className="text-center text-xs text-gray-600 mt-4 tracking-[0.5em] uppercase">Screen this way</p>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col gap-4 mb-20 overflow-x-auto pb-4">
        {Object.entries(rows).map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className="flex items-center gap-6 justify-center min-w-max">
            <span className="w-6 text-xs text-gray-600 font-bold">{rowLabel}</span>
            <div className="flex gap-3">
              {rowSeats.sort((a, b) => a.number - b.number).map((seat) => {
                const isSelected = selectedSeats.includes(seat.id);
                const isOccupied = seat.status !== 'AVAILABLE';
                
                return (
                  <button
                    key={seat.id}
                    disabled={isOccupied}
                    onClick={() => toggleSeat(seat.id)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative group",
                      isOccupied ? "bg-gray-800 text-gray-900 cursor-not-allowed" : 
                      isSelected ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" : 
                      "bg-white/5 text-gray-400 hover:bg-white/20 border border-white/5"
                    )}
                  >
                    <Armchair className="w-4 h-4" />
                    {!isOccupied && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {rowLabel}{seat.number}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <span className="w-6 text-xs text-gray-600 font-bold">{rowLabel}</span>
          </div>
        ))}
      </div>

      {/* Footer / Summary */}
      <div className="sticky bottom-8 glass p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6 shadow-2xl border border-white/10">
        <div>
          <p className="text-sm text-gray-400">Selected Seats</p>
          <div className="flex gap-2 mt-1">
            {selectedSeats.length > 0 ? (
              <p className="text-xl font-bold text-white">
                {selectedSeats.map(id => {
                  const s = seats.find(seat => seat.id === id);
                  return `${s?.row}${s?.number}`;
                }).join(', ')}
              </p>
            ) : (
              <p className="text-xl font-bold text-gray-600 italic text-sm">No seats selected</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Price</p>
            <p className="text-3xl font-bold text-white">₹{selectedSeats.length * 250}</p>
          </div>
          <button
            onClick={handleProceed}
            disabled={selectedSeats.length === 0 || isLocking}
            className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none flex items-center gap-2"
          >
            {isLocking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Selection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;

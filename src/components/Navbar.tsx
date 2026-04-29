import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, Film, Star, User, Headphones, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isPremium = localStorage.getItem('isPremium') === 'true';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isPremium');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="w-full bg-[#070b0a] border-b border-white/5 relative z-50">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-[#0a0f0c] border-l border-white/5 z-[110] p-12 shadow-[-50px_0_100px_rgba(0,0,0,0.8)] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-16">
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.5em]">Private Access</span>
                <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-12">
                {isPremium && (
                  <div className="p-8 rounded-[2rem] bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 shadow-[0_20px_40px_rgba(212,175,55,0.05)]">
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="w-5 h-5 text-accent fill-accent" />
                      <span className="text-sm font-bold text-white uppercase tracking-wider">Cinelix + Member</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">You have full access to zero fees, early booking, and 24/7 concierge support.</p>
                  </div>
                )}

                <div className="space-y-12">
                  <div className="space-y-6">
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.3em]">Personal Premiere</p>
                    <nav className="flex flex-col gap-10">
                      <Link to="/profile" className="flex items-center gap-6 group" onClick={() => setIsMenuOpen(false)}>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-[#070b0a] transition-all shadow-lg">
                          <User className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-cinematic text-white group-hover:text-accent transition-colors">My Profile</span>
                      </Link>
                      
                      <Link to="/my-bookings" className="flex items-center gap-6 group" onClick={() => setIsMenuOpen(false)}>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-[#070b0a] transition-all shadow-lg">
                          <Film className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-cinematic text-white group-hover:text-accent transition-colors">Booking History</span>
                      </Link>

                      <button className="flex items-center gap-6 group text-left w-full" onClick={() => setIsMenuOpen(false)}>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-[#070b0a] transition-all shadow-lg">
                          <Headphones className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-2xl font-cinematic text-white group-hover:text-accent transition-colors">Concierge Support</span>
                          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Direct Priority Line</span>
                        </div>
                      </button>
                    </nav>
                  </div>

                  <div className="pt-10 border-t border-white/5">
                    <div className="flex flex-col gap-6">
                      <Link to="/offers" className="text-sm font-medium text-gray-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Exclusive Offers</Link>
                      <Link to="/plans" className="text-sm font-medium text-gray-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Membership Status</Link>
                      {role === 'ADMIN' && (
                        <Link to="/admin" className="text-sm font-bold text-accent hover:text-white transition-colors text-left" onClick={() => setIsMenuOpen(false)}>Admin Console</Link>
                      )}
                      {isAuthenticated && (
                        <button onClick={handleLogout} className="text-sm font-bold text-primary/80 hover:text-primary transition-colors text-left">Logout Session</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-10 flex-1">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center transition-all group-hover:rotate-12 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
               <Film className="text-[#070b0a] w-6 h-6" />
             </div>
             <div className="flex items-start">
               <span className="text-3xl font-cinematic tracking-tight text-white">cinelix</span>
               {isPremium && <span className="text-accent text-xl font-bold ml-1 mt-1">+</span>}
             </div>
          </Link>
          
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-5 py-2.5 w-full max-w-[500px] focus-within:border-accent/50 transition-all">
            <Search className="w-4 h-4 text-gray-500 mr-3" />
            <input 
              type="text" 
              placeholder="Discover cinematic experiences..." 
              className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-600 font-inter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/movies?search=${e.currentTarget.value}`);
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-8">
          {!isPremium && (
            <button 
              onClick={() => navigate('/plans')}
              className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-accent to-yellow-700 text-[#070b0a] px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl group"
            >
              <Star className="w-3.5 h-3.5 fill-[#070b0a] group-hover:rotate-12 transition-transform" />
              Upgrade to Cinelix +
            </button>
          )}
          
          <div className="flex items-center gap-6">
            {!isAuthenticated && (
              <Link to="/login" className="bg-white/5 border border-white/10 text-white px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#070b0a] transition-all">Sign in</Link>
            )}
            {isAuthenticated && role === 'ADMIN' && (
              <Link to="/admin" className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent hover:text-white transition-colors">Admin Dashboard</Link>
            )}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
            >
              <Menu className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#111815]/50 backdrop-blur-md border-b border-white/5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
          <div className="flex gap-8">
            <Link to="/movies" className="hover:text-accent transition-colors">Movies</Link>
            <Link to="#" className="hover:text-accent transition-colors">Events</Link>
          </div>
          <div className="flex gap-8">
            <Link to="/offers" className="hover:text-accent transition-colors">Offers</Link>
            <Link to="#" className="hover:text-accent transition-colors">Gift Cards</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

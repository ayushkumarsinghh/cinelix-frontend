import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Menu, Film } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Mumbai');

  const locations = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai'];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="w-full bg-[#070b0a] border-b border-white/5 relative z-50">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 h-[68px] flex items-center justify-between">
        <div className="flex items-center gap-8 flex-1">
          <Link to="/" className="flex items-center gap-2 group">
             <div className="w-8 h-8 rounded bg-accent flex items-center justify-center transition-transform group-hover:scale-105">
               <Film className="text-[#070b0a] w-5 h-5" />
             </div>
             <span className="text-2xl font-bold tracking-tighter text-white font-inter">cinelix</span>
          </Link>
          <div className="hidden md:flex items-center bg-[#111815] border border-white/10 rounded-md px-3 py-2 w-full max-w-[600px]">
            <Search className="w-4 h-4 text-gray-500 mr-3" />
            <input 
              type="text" 
              placeholder="Search for Movies, Events, Plays, Sports and Activities" 
              className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-500 font-inter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/movies?search=${e.currentTarget.value}`);
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <button 
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1 text-[14px] text-gray-400 hover:text-white font-inter transition-colors py-2"
            >
              {selectedLocation} <ChevronDown className={`w-4 h-4 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showLocationDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLocationDropdown(false)} />
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#111815] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  <Link 
                    to="/offers" 
                    onClick={() => setShowLocationDropdown(false)}
                    className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-inter"
                  >
                    Offers
                  </Link>
                  <div className="px-4 py-2 border-b border-white/5 mb-2">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Select Location</p>
                  </div>
                  {locations.map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedLocation(city);
                        setShowLocationDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5 ${selectedLocation === city ? 'text-accent font-bold bg-accent/5' : 'text-gray-300 hover:text-white'}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/my-bookings" className="text-sm font-medium text-gray-300 hover:text-white">Bookings</Link>
              {role === 'ADMIN' && <Link to="/admin" className="text-sm font-medium text-gray-300 hover:text-white">Admin</Link>}
              <button onClick={handleLogout} className="bg-accent/10 border border-accent text-accent px-4 py-1.5 rounded text-xs font-bold hover:bg-accent hover:text-[#070b0a] transition-all">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="bg-accent text-[#070b0a] px-5 py-1.5 rounded text-xs font-bold hover:bg-white transition-all shadow-[0_0_15px_rgba(94,210,156,0.2)]">Sign in</Link>
          )}
          
          <Menu className="w-7 h-7 text-gray-400 hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Sub Bar */}
      <div className="bg-[#111815] border-b border-white/5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between text-[13px] text-gray-400 font-inter font-medium">
          <div className="flex gap-6">
            <Link to="/movies" className="hover:text-white transition-colors">Movies</Link>
          </div>
          <div className="flex gap-6 text-[12px]">
            <Link to="/offers" className="hover:text-white transition-colors">Offers</Link>
            <Link to="#" className="hover:text-white transition-colors">Gift Cards</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

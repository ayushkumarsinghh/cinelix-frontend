import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Film, Ticket } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark h-16 px-6 md:px-12 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <Film className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tighter text-white">CINELIX</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/movies" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Movies</Link>
        {isAuthenticated && (
          <Link to="/my-bookings" className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            My Bookings
          </Link>
        )}
        
        {isAuthenticated ? (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        ) : (
          <Link 
            to="/login" 
            className="bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-all transform hover:scale-105"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

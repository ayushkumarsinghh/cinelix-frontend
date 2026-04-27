import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Placeholder Components (to be replaced with real ones)
import Login from './pages/Login';
import Movies from './pages/Movies';
import MovieShows from './pages/MovieShows';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import MyBookings from './pages/MyBookings';

import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <div className="min-h-screen bg-black pt-16">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id/shows" element={<MovieShows />} />
          <Route path="/shows/:id/seats" element={<SeatSelection />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/" element={<Navigate to="/movies" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Placeholder Components (to be replaced with real ones)
import Login from './pages/Login';
import Movies from './pages/Movies';
import MovieShows from './pages/MovieShows';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import VerifyTicket from './pages/VerifyTicket';
import Offers from './pages/Offers';

import Navbar from './components/Navbar';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Set base URL for API requests. In production, this points to your deployed backend.
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#070b0a]">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id/shows" element={<MovieShows />} />
          <Route path="/shows/:id/seats" element={<SeatSelection />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/verify/:id" element={<VerifyTicket />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/" element={<Navigate to="/movies" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

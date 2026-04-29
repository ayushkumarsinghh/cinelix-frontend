import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Calendar, Star, Ticket, ChevronRight, Shield, Bell, Loader2, CheckCircle2, AlertCircle, Gift } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/users/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!window.confirm('Are you sure you want to end your Cinelix + membership? You will lose all premium benefits immediately.')) {
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/users/cancel-membership', {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('isPremium', 'false');
      await fetchProfile();
      setMessage({ type: 'success', text: 'Membership ended. We hope to see you back soon!' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to cancel membership' });
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateDaysRemaining = (expiry: string) => {
    if (!expiry) return 0;
    const today = new Date();
    const expiryDate = new Date(expiry);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b0a]">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    );
  }

  const daysRemaining = user?.premiumUntil ? calculateDaysRemaining(user.premiumUntil) : 0;

  return (
    <div className="min-h-screen bg-[#070b0a] pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-accent flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.2)]">
              <User className="w-12 h-12 text-[#070b0a]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-cinematic text-white">{user?.email.split('@')[0]}</h1>
                {user?.isPremium && (
                  <span className="bg-accent text-[#070b0a] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter italic">
                    Cinelix +
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">{user?.email}</p>
                <button 
                  onClick={fetchProfile}
                  className="text-[10px] font-bold text-accent/60 hover:text-accent uppercase tracking-widest transition-all"
                >
                  Sync Status
                </button>
              </div>
            </div>
          </div>
          
          {user?.isPremium && (
            <div className="flex flex-col items-end gap-4">
              <div className="bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/30 rounded-2xl px-8 py-4 backdrop-blur-xl text-right">
                <div className="flex items-center justify-end gap-3 mb-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Cinelix + Membership</span>
                </div>
                <p className="text-2xl font-cinematic text-accent">{daysRemaining} <span className="text-xs font-sans text-gray-400 uppercase tracking-widest ml-1">Days Remaining</span></p>
              </div>
              <button 
                onClick={handleCancelMembership}
                className="text-[9px] font-bold text-primary/50 hover:text-primary uppercase tracking-[0.2em] transition-colors mr-2"
              >
                End Membership
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Stats Column */}
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-8">Premiere Stats</h3>
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-gray-300 font-medium">Total Bookings</span>
                  </div>
                  <span className="text-2xl font-cinematic text-white">{user?._count?.bookings || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-gray-300 font-medium">{user?.isPremium ? 'Member Since' : 'Account Created'}</span>
                  </div>
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              
              <Link 
                to="/my-bookings" 
                className="mt-12 w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all group"
              >
                View History
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {user?.isPremium && (
              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-8">Active Benefits</h3>
                  <div className="space-y-4">
                    {['Reduced Convenience Fees (₹12.50)', 'Early Access', 'Concierge Support', 'Premium Lounge Access'].map(benefit => (
                      <div key={benefit} className="flex items-center gap-3 text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-accent/60" />
                        <span className="text-xs font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-[2.5rem] p-10 backdrop-blur-3xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Cinelix Wallet</h3>
                    <Gift className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-3xl font-cinematic text-white mb-2">₹{user?.walletBalance?.toFixed(2) || '0.00'}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Available Credits</p>
                </div>
              </div>
            )}
          </div>

          {/* Settings Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 backdrop-blur-3xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-cinematic text-white">Security & Password</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Keep your access secure</p>
                </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-8">
                {message.text && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}
                  >
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{message.text}</span>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] ml-1">Current Password</label>
                    <input 
                      type="password"
                      value={passwords.current}
                      onChange={e => setPasswords({...passwords, current: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent/50 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="hidden md:block"></div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] ml-1">New Password</label>
                    <input 
                      type="password"
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent/50 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                    <input 
                      type="password"
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent/50 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="bg-accent text-[#070b0a] px-10 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 backdrop-blur-3xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-cinematic text-white">Notifications</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Manage your premiere alerts</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { title: 'Email Notifications', desc: 'Receive booking confirmations and receipts' },
                  { title: 'SMS Alerts', desc: 'Get entry codes and theatre updates' }
                ].map(item => (
                  <div key={item.title} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">{item.title}</h4>
                      <p className="text-[11px] text-gray-500 font-medium">{item.desc}</p>
                    </div>
                    <div className="w-12 h-6 bg-accent rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-[#070b0a] rounded-full shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

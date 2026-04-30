import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Ticket, Loader2, AlertCircle, Gift } from 'lucide-react';
import axios from 'axios';

declare const Razorpay: any;

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showId, seatIds } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [user, setUser] = useState<any>(null);
  const [show, setShow] = useState<any>(null);
  const [useWallet, setUseWallet] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userRes, showRes] = await Promise.all([
          axios.get('/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/api/shows/${showId}`)
        ]);
        
        if (isMounted) {
          setUser(userRes.data);
          setShow(showRes.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch data', err);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [showId]);

  const ticketPrice = (seatIds?.length || 0) * (show?.price || 0);
  const isPremium = user?.isPremium;
  const convenienceFee = isPremium ? 12.5 : 30;
  const walletBalance = user?.walletBalance || 0;
  const walletAppliedAmount = useWallet ? Math.min(walletBalance, ticketPrice + convenienceFee - discountAmount) : 0;
  const totalAmount = ticketPrice + convenienceFee - discountAmount - walletAppliedAmount;

  const handleApplyPromo = () => {
    if (!promoCode) return;
    setIsApplying(true);
    setPromoError('');
    
    // In a real app, this would be an API call to /api/promo/validate
    setTimeout(() => {
      const code = promoCode.toUpperCase();
      let discount = 0;
      
      if (code === 'CINELIX50') {
        discount = Math.floor(ticketPrice * 0.5);
      } else if (code === 'WEEKEND100' && ticketPrice >= 500) {
        discount = 100;
      } else if (code === 'BOI20') {
        discount = Math.floor(ticketPrice * 0.2);
      } else {
        setPromoError('Invalid or expired promo code');
        setIsApplying(false);
        return;
      }

      setDiscountAmount(discount);
      setAppliedPromo(code);
      setIsApplying(false);
    }, 800);
  };

  useEffect(() => {
    if (!showId || !seatIds) {
      navigate('/movies');
    }
  }, [showId, seatIds, navigate]);

  const handlePayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // 1. Create Order on Backend
      const orderRes = await axios.post('/api/payment/create-order', {
        showId,
        seatIds,
        walletAmount: walletAppliedAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { orderId, amount, keyId, bookingId } = orderRes.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: "INR",
        name: "Cinelix",
        description: "Movie Ticket Booking",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // 3. Verify Payment on Backend
            await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              showId,
              seatIds,
              bookingId,
              walletAmount: walletAppliedAmount
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/my-bookings');
          } catch (err: any) {
            console.error('Verification failed:', err);
            setError(err.response?.data?.message || 'Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com"
        },
        theme: {
          color: "#E50914"
        }
      };

      const rzp = new Razorpay(options);
      
      // For testing/mocking: If the key is a mock key, simulate success
      if (keyId === 'rzp_test_mock') {
        console.log("SIMULATION: Mock key detected. Simulating successful payment in 1.5s...");
        setTimeout(() => {
          options.handler({
            razorpay_order_id: orderId,
            razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
            razorpay_signature: 'mock_sig_' + Math.random().toString(36).substr(2, 9)
          });
        }, 1500);
      } else {
        rzp.open();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="glass p-12 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Ticket className="text-primary w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-cinematic text-white tracking-tight">Checkout</h1>
              <p className="text-gray-400">Complete your booking for {seatIds?.length} seats</p>
            </div>
          </div>

          {error && (
            <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl mb-8 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Promo Code</h3>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Enter code (e.g. CINELIX50)"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      disabled={!!appliedPromo}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent transition-all font-medium placeholder-gray-700"
                    />
                    {appliedPromo && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-accent font-bold text-[10px] uppercase">
                        <ShieldCheck className="w-3 h-3" /> Applied
                      </div>
                    )}
                  </div>
                  {!appliedPromo ? (
                    <button 
                      onClick={handleApplyPromo}
                      disabled={isApplying || !promoCode}
                      className="px-6 py-3 bg-white/5 hover:bg-accent hover:text-[#070b0a] text-white rounded-xl font-bold transition-all disabled:opacity-50 border border-white/5"
                    >
                      {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => {setAppliedPromo(''); setDiscountAmount(0); setPromoCode('');}}
                      className="px-4 py-3 text-primary hover:text-primary/80 font-bold transition-all text-xs uppercase"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {promoError && <p className="text-primary text-[10px] font-bold uppercase tracking-wider ml-1">{promoError}</p>}
              </div>

              {walletBalance > 0 && (
                <div className={`p-6 rounded-2xl border transition-all ${useWallet ? 'bg-accent/5 border-accent' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${useWallet ? 'bg-accent text-[#070b0a]' : 'bg-white/10 text-gray-400'}`}>
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Cinelix Wallet</h4>
                        <p className="text-xs text-gray-500 font-medium">Available: ₹{walletBalance.toFixed(2)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setUseWallet(!useWallet)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${useWallet ? 'bg-accent text-[#070b0a]' : 'bg-white/10 text-white'}`}
                    >
                      {useWallet ? 'Applied' : 'Use Balance'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Tickets ({seatIds?.length}x)</span>
                    <span>₹{ticketPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Convenience Fee</span>
                    <div className="flex items-center gap-2">
                      {isPremium && <span className="line-through text-gray-500 text-xs">₹30</span>}
                      <span className={isPremium ? 'text-accent font-bold' : ''}>₹{convenienceFee}</span>
                    </div>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-accent font-bold">
                      <span className="flex items-center gap-1"><Ticket className="w-3 h-3" /> Promo ({appliedPromo})</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  {useWallet && walletAppliedAmount > 0 && (
                    <div className="flex justify-between text-accent font-bold">
                      <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Wallet Balance</span>
                      <span>-₹{walletAppliedAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/5 my-2"></div>
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="text-emerald-500 w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white">Secure Checkout</h4>
                    <p className="text-sm text-gray-400 mt-1">Your payment is processed securely via Razorpay. We don't store your card details.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover text-white py-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" /> Pay Now
                  </>
                )}
              </button>
              <p className="text-center text-gray-500 mt-6 text-sm">
                By clicking Pay Now, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

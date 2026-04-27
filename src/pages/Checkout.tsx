import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Ticket, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

declare const Razorpay: any;

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showId, seatIds } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        seatIds
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
              bookingId
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
              <h1 className="text-3xl font-bold text-white">Checkout</h1>
              <p className="text-gray-400">Complete your booking for {seatIds?.length} seats</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Tickets ({seatIds?.length}x)</span>
                    <span>₹{seatIds?.length * 250}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Convenience Fee</span>
                    <span>₹30</span>
                  </div>
                  <div className="h-px bg-white/5 my-2"></div>
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{seatIds?.length * 250 + 30}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="text-green-500 w-6 h-6 flex-shrink-0" />
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

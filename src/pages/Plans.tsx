import React, { useState } from 'react';
import { Check, Star, Zap, ArrowRight, ShieldCheck, Clock, Ticket, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

declare const Razorpay: any;

const Plans = () => {
  const navigate = useNavigate();
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const benefits = [
    {
      name: "Standard Experience",
      price: "Free",
      description: "Basic access for the casual moviegoer.",
      features: [
        "Standard Booking Fees Apply",
        "Regular Ticket Access",
        "Digital Ticket History",
        "Standard Customer Support"
      ],
      icon: <Ticket className="w-6 h-6 text-gray-500" />,
      color: "from-white/5 to-transparent",
      borderColor: "border-white/10",
      buttonText: "Current Plan"
    },
    {
      name: "Cinelix +",
      price: "499",
      duration: "Year",
      description: "The ultimate membership for true cinephiles.",
      features: [
        "Zero Booking Fees on All Tickets",
        "48-Hour Early Pre-Booking Access",
        "Exclusive Premiere Invitations",
        "Fast-Track Cinema Entry",
        "24/7 Priority Concierge Support"
      ],
      icon: <Star className="w-8 h-8 text-accent" />,
      color: "from-accent/20 to-accent/5",
      borderColor: "border-accent/40",
      featured: true,
      buttonText: "Upgrade Now"
    }
  ];

  const handleUpgrade = async () => {
    if (!isTermsAccepted) {
      setError('Please accept the Terms & Conditions to proceed.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const orderRes = await axios.post('/api/payment/create-order', {
        type: 'SUBSCRIPTION',
        planName: 'Cinelix+',
        amount: 499
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { orderId, amount, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: "INR",
        name: "Cinelix",
        description: "Cinelix + Membership",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              type: 'SUBSCRIPTION'
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            localStorage.setItem('isPremium', 'true');
            setShowSuccess(true);
            
            setTimeout(() => {
              navigate('/movies');
              window.location.reload();
            }, 3000);
          } catch (err: any) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: "Cinelix Member",
          email: "member@cinelix.com"
        },
        theme: {
          color: "#D4AF37"
        }
      };

      if (keyId === 'rzp_test_mock') {
        setTimeout(() => {
          options.handler({
            razorpay_order_id: orderId,
            razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
            razorpay_signature: 'mock_sig_' + Math.random().toString(36).substr(2, 9)
          });
        }, 1500);
      } else {
        const rzp = new Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#070b0a] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-gradient-to-b from-accent/20 to-accent/5 backdrop-blur-3xl border border-accent/30 rounded-[3.5rem] p-12 text-center shadow-[0_0_100px_rgba(212,175,55,0.15)]"
        >
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(212,175,55,0.4)]">
            <Star className="text-[#070b0a] w-12 h-12 fill-[#070b0a]" />
          </div>
          <h2 className="text-4xl font-cinematic text-white mb-4">Congratulations!</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            You are now a <span className="text-accent font-bold">Cinelix +</span> member. 
            Unlock a world of zero fees, early access, and premium cinema.
          </p>
          <div className="h-1 bg-accent/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "linear" }}
              className="h-full bg-accent"
            />
          </div>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-4">Redirecting to Premiere...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b0a] pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 blur-[150px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto text-center mb-24">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-[1px] bg-accent"></div>
          <span className="text-[10px] font-bold text-accent uppercase tracking-[0.5em]">Exclusive Membership</span>
          <div className="w-12 h-[1px] bg-accent"></div>
        </div>
        <h1 className="text-6xl md:text-8xl font-cinematic text-white tracking-tight mb-8">Redefine Your <span className="text-accent italic">Cinema</span></h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Skip the fees, jump the queues, and secure the best seats before anyone else. 
          Cinelix + is designed for those who don't just watch movies, but live them.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {benefits.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            className={`relative p-12 rounded-[3.5rem] border ${plan.borderColor} bg-gradient-to-b ${plan.color} backdrop-blur-3xl group transition-all duration-500 ${plan.featured ? 'scale-105 shadow-[0_50px_100px_-20px_rgba(212,175,55,0.15)]' : 'opacity-80'}`}
          >
            {plan.featured && (
              <div className="absolute -top-6 left-10 bg-accent text-[#070b0a] px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl">
                Highly Recommended
              </div>
            )}
            
            <div className="mb-12">
              <div className="mb-6">{plan.icon}</div>
              <h3 className="text-4xl font-cinematic text-white mb-3">{plan.name}</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-cinematic text-white tracking-tighter">₹{plan.price}</span>
                {plan.duration && <span className="text-gray-500 text-sm">/{plan.duration}</span>}
              </div>
            </div>

            <div className="space-y-6 mb-12">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-4 text-gray-300">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${plan.featured ? 'border-accent/40 bg-accent/10' : 'border-white/10 bg-white/5'}`}>
                    <Check className={`w-3 h-3 ${plan.featured ? 'text-accent' : 'text-gray-500'}`} />
                  </div>
                  <span className="text-sm font-medium tracking-wide">{feature}</span>
                </div>
              ))}
            </div>

            {plan.featured && (
              <div className="mb-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={isTermsAccepted}
                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                  />
                  <div className="w-5 h-5 border border-white/20 rounded bg-white/5 peer-checked:bg-accent peer-checked:border-accent transition-all flex items-center justify-center">
                    <Check className={`w-3.5 h-3.5 text-[#070b0a] ${isTermsAccepted ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium group-hover:text-gray-400 transition-colors uppercase tracking-wider">
                    I agree to the Terms & Conditions
                  </span>
                </label>
                {error && <p className="text-red-500 text-[10px] font-bold mt-3 uppercase tracking-wider ml-1">{error}</p>}
              </div>
            )}

            <button 
              onClick={plan.featured ? handleUpgrade : undefined}
              disabled={isLoading || (plan.featured && !isTermsAccepted)}
              className={`w-full py-6 rounded-full font-bold uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 group ${
                plan.featured 
                  ? 'bg-accent text-[#070b0a] hover:bg-white shadow-xl disabled:opacity-50' 
                  : 'bg-white/5 border border-white/10 text-white cursor-default'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {plan.buttonText}
                  {plan.featured && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto border-t border-white/5 pt-16">
        <div className="text-center">
          <ShieldCheck className="w-8 h-8 text-accent/40 mx-auto mb-4" />
          <h4 className="text-white font-cinematic text-lg mb-2">Zero Hidden Fees</h4>
          <p className="text-gray-500 text-xs leading-relaxed">What you see is what you pay. No convenience charges, ever.</p>
        </div>
        <div className="text-center">
          <Clock className="w-8 h-8 text-accent/40 mx-auto mb-4" />
          <h4 className="text-white font-cinematic text-lg mb-2">Early Access</h4>
          <p className="text-gray-500 text-xs leading-relaxed">Be the first to grab the best seats for major blockbusters.</p>
        </div>
        <div className="text-center">
          <Zap className="w-8 h-8 text-accent/40 mx-auto mb-4" />
          <h4 className="text-white font-cinematic text-lg mb-2">Instant Booking</h4>
          <p className="text-gray-500 text-xs leading-relaxed">Faster checkout and dedicated support for every ticket.</p>
        </div>
      </div>
    </div>
  );
};

export default Plans;

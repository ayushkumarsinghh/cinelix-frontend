import { Ticket, Gift, CreditCard, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Offers = () => {
  const offers = [
    {
      id: 1,
      title: "First Timer's Luck",
      description: "Get 50% OFF on your very first booking with Cinelix.",
      code: "CINELIX50",
      color: "from-accent to-emerald-500",
      icon: <Sparkles className="w-8 h-8" />,
      expiry: "Valid till 31st May",
      type: "Discount"
    },
    {
      id: 2,
      title: "Weekend Blockbuster",
      description: "Flat ₹100 OFF on all bookings above ₹500 every Saturday & Sunday.",
      code: "WEEKEND100",
      color: "from-blue-600 to-indigo-600",
      icon: <Ticket className="w-8 h-8" />,
      expiry: "Limited Period Offer",
      type: "Cashback"
    },
    {
      id: 3,
      title: "Popcorn & Chill",
      description: "Get a free Medium Popcorn combo on bookings of 4 or more seats.",
      code: "FREECOMBO",
      color: "from-purple-600 to-pink-600",
      icon: <Gift className="w-8 h-8" />,
      expiry: "Every Wednesday",
      type: "Reward"
    },
    {
      id: 4,
      title: "Bank of India Special",
      description: "Use your BOI Credit Card and get 20% instant discount.",
      code: "BOI20",
      color: "from-orange-500 to-red-600",
      icon: <CreditCard className="w-8 h-8" />,
      expiry: "Valid on all days",
      type: "Bank Offer"
    }
  ];

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Code ${code} copied to clipboard!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="mb-16">
        <h1 className="text-5xl font-extrabold text-white uppercase tracking-tight mb-4">
          Exclusive <span className="text-accent">Offers</span>
        </h1>
        <p className="text-gray-500 text-lg font-medium max-w-2xl">
          Unlock the best deals and cinematic experiences. Apply these codes at checkout to save big on your favorite movies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {offers.map((offer, index) => (
          <motion.div 
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-[#111815] rounded-[3rem] border border-white/5 overflow-hidden p-8 hover:border-accent/30 transition-all shadow-2xl"
          >
            {/* Background Gradient Glow */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${offer.color} opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-500`}></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${offer.color} flex items-center justify-center text-white shadow-xl`}>
                  {offer.icon}
                </div>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {offer.type}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-3">
                {offer.title}
              </h2>
              <p className="text-gray-400 font-medium mb-8 flex-grow">
                {offer.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Promo Code</p>
                  <button 
                    onClick={() => copyCode(offer.code)}
                    className="flex items-center gap-2 group/code"
                  >
                    <span className="text-xl font-black text-accent tracking-widest">{offer.code}</span>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover/code:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Expires</p>
                  <p className="text-sm font-bold text-gray-400">{offer.expiry}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 p-12 rounded-[4rem] bg-gradient-to-br from-accent/20 to-transparent border border-accent/10 relative overflow-hidden text-center">
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-white uppercase tracking-tight mb-4">Refer a Friend & Earn</h3>
          <p className="text-gray-400 max-w-xl mx-auto mb-8 font-medium">Share the joy of cinema! Get ₹50 in your Cinelix Wallet for every friend who signs up and books their first show.</p>
          <button className="bg-accent text-[#070b0a] px-10 py-4 rounded-2xl font-bold uppercase italic tracking-tight hover:bg-white transition-all shadow-xl shadow-accent/20">
            Invite Friends Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Offers;

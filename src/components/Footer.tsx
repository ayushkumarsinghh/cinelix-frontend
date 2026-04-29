import { Film, Mail, Github, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal } from './Reveal';

const Footer = () => {
  return (
    <footer className="bg-[#070b0a] border-t border-white/5 pt-20 pb-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-accent/20">
            <Film className="text-[#070b0a] w-6 h-6" />
          </div>
          <span className="text-3xl font-black text-white tracking-tighter italic uppercase">
            Cinelix<span className="text-accent">+</span>
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm max-w-md mb-12 font-medium leading-relaxed">
          Premium cinematic experiences delivered with state-of-the-art technology. 
          The future of entertainment is here.
        </p>

        {/* Get In Touch */}
        <div className="flex flex-col items-center gap-4 mb-16">
          <h4 className="text-accent font-black uppercase tracking-[0.4em] text-[10px]">Get In Touch</h4>
          <Reveal>
            <a 
              href="mailto:ayush2006singh2622@gmail.com" 
              className="flex items-center gap-3 text-white hover:text-accent transition-all group bg-white/5 px-8 py-4 rounded-2xl border border-white/5 hover:border-accent/20"
            >
              <Mail className="w-5 h-5 text-accent" />
              <span className="font-bold tracking-tight">ayush2006singh2622@gmail.com</span>
            </a>
          </Reveal>
        </div>

        {/* Socials & Copyright */}
        <div className="w-full pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
            © 2026 Cinelix Entertainment. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="https://github.com/ayushkumarsinghh" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
            <a href="https://x.com/AyushKumar65771" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

"use client";

import { ArrowRight, Music, Play, Linkedin, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SupportModal } from "@frontend/components/support-modal";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#000000] text-white selection:bg-primary selection:text-black">
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[0%] right-[-10%] w-[60%] h-[60%] bg-magenta/10 blur-[150px] rounded-full animate-pulse opacity-50" style={{ backgroundColor: 'rgba(217, 70, 239, 0.15)' }} />
        <div className="absolute inset-0 bg-mesh opacity-30" />
        
        {/* Animated Soundwave Lines (Pseudo-elements or SVG) */}
        <svg className="absolute bottom-0 w-full h-64 opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            fill="none" 
            stroke="#1DB954" 
            strokeWidth="2" 
            d="M0,160 C320,300 420,0 720,160 C1020,320 1120,20 1440,160"
            className="animate-wave"
          />
          <path 
            fill="none" 
            stroke="#d946ef" 
            strokeWidth="1" 
            d="M0,180 C320,340 420,20 720,180 C1020,340 1120,40 1440,180"
            className="animate-wave-slow opacity-50"
          />
        </svg>
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-black/60 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
          {/* Logo Placeholder (matching the icon in the image) */}
          <div className="flex items-center gap-3 group cursor-pointer">
            {/* Logo could go here, for now using the icon style from the mockup */}
          </div>
          
          <div className="flex items-center gap-8">
            <Link
              href="/login"
              className="text-sm font-bold tracking-tight hover:text-primary transition-colors py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-[#3FE080] text-black rounded-full px-8 py-2.5 font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(63,224,128,0.3)]"
            >
              GET STARTED
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="text-center lg:text-left">
            {/* Logo Icon from Mockup */}
            <div className="inline-block mb-12">
              <div className="relative h-20 w-20 bg-[#1a113d] rounded-2xl flex items-center justify-center p-4 border border-white/10 shadow-2xl overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <img src="/assets/hero-1.png" className="w-full h-full object-contain hidden" alt="logo" />
                 <div className="w-12 h-12 bg-gradient-to-br from-[#FE3B71] to-[#D92662] rounded-lg flex items-center justify-center shadow-lg transform rotate-[-5deg]">
                    <Music className="text-white h-7 w-7" />
                 </div>
              </div>
            </div>

            <h1 className="mb-8 text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] lg:max-w-xl">
              Listen Together <br />
              <span className="text-[#3FE080] drop-shadow-[0_0_30px_rgba(63,224,128,0.4)]">on SONIQ</span>
            </h1>

            <p className="text-[#A0A0B0] mb-12 text-base md:text-xl font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
               SONIQ is a real-time social music web app where users can listen to YouTube songs together in perfectly synced rooms. Create or join rooms, chat, manage queues, assign roles (Admin, DJ, Moderator), and enjoy a premium, interactive shared-listening experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 lg:gap-6">
              <Link
                href="/explore"
                className="w-full sm:w-auto group relative bg-[#3FE080] text-black px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(63,224,128,0.4)] active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                <span className="relative z-10">EXPLORE ROOMS</span>
              </Link>
              <Link
                href="/room/create"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl border-2 border-[#121212]/50 bg-[#0A0A0A]/80 text-white font-black text-sm uppercase tracking-widest transition-all hover:bg-white/5 hover:border-white/20 active:scale-95 text-center backdrop-blur-sm shadow-xl"
              >
                CREATE YOUR ROOM
              </Link>
            </div>
          </div>

          {/* Right Side: Mockups (Using the images provided) */}
          <div className="relative mt-20 lg:mt-0 flex items-center justify-center px-4 sm:px-0">
             {/* Glow behind images */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
             
             {/* Desktop & Mobile Mockups Wrapper */}
             <div className="relative w-full max-w-[600px]">
                {/* Desktop Screen Mockup */}
                <div className="relative w-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#0A0A0A] transform group transition-transform duration-700 hover:scale-[1.02]">
                   <img 
                      src="/assets/hero-1.png" 
                      alt="SONIQ Desktop Mockup" 
                      className="w-full h-auto"
                   />
                </div>
                
                {/* Mobile Screen Mockup (Overlapping) */}
                <div className="absolute -bottom-6 -left-6 sm:-bottom-10 sm:-left-10 w-[45%] rounded-2xl sm:rounded-[3rem] border-4 sm:border-8 border-[#121212] shadow-2xl overflow-hidden bg-[#0A0A0A] transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700">
                   <img 
                      src="/assets/hero-2.png" 
                      alt="SONIQ Mobile Mockup" 
                      className="w-full h-auto scale-[1.05]"
                   />
                </div>

                {/* Optional Floating Element (Music Cube) */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#0C1221] rounded-3xl border border-white/5 shadow-2xl hidden md:flex items-center justify-center animate-bounce-slow">
                   <div className="w-24 h-24 bg-gradient-to-br from-[#FF1A6C] to-[#C90D56] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,26,108,0.3)]">
                      <Music className="text-white w-12 h-12" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer (Minimal and Premium) */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
               <Music className="text-primary w-5 h-5" />
            </div>
            <span className="font-black tracking-tighter text-xl">SONIQ</span>
          </div>
          <p className="text-[#606070] text-sm font-medium">
            © 2026 SONIQ. DESIGNED FOR THE NEW WAVE OF LISTENING.
          </p>
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsSupportOpen(true)}
              className="text-xs font-black text-[#808090] uppercase tracking-widest hover:text-[#3FE080] transition-colors flex items-center gap-2 group"
            >
              <LifeBuoy className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Help & Support</span>
            </button>
            <a href="https://www.linkedin.com/in/soumyajeet-chatterjee-a4095111a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" className="text-xs font-black text-[#808090] uppercase tracking-widest hover:text-[#3FE080] transition-colors flex items-center gap-2 group">
              <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
            <a href="#" className="text-xs font-black text-[#808090] uppercase tracking-widest hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-xs font-black text-[#808090] uppercase tracking-widest hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-xs font-black text-[#808090] uppercase tracking-widest hover:text-white transition-colors">Discord</a>
          </div>
        </div>
      </footer>

      {/* Tailwind Custom Animations for Wave */}
      <style jsx global>{`
        @keyframes wave {
          0% { d: path("M0,160 C320,300 420,0 720,160 C1020,320 1120,20 1440,160"); }
          50% { d: path("M0,180 C320,280 420,20 720,180 C1020,340 1120,40 1440,180"); }
          100% { d: path("M0,160 C320,300 420,0 720,160 C1020,320 1120,20 1440,160"); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-wave { animation: wave 10s ease-in-out infinite; }
        .animate-wave-slow { animation: wave 15s ease-in-out infinite reverse; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </main>
  );
}

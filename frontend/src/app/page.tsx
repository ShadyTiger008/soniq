"use client";

import { ArrowRight, Music, Play, Linkedin, LifeBuoy, Zap, Shield, Sparkles, Radio, Layers, Command, Share2, Globe } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion";
import { SupportModal } from "@frontend/components/support-modal";

export default function Home() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax transforms
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  
  const mockupScale = useTransform(scrollYProgress, [0.1, 0.4], [0.8, 1.1]);
  const mockupRotate = useTransform(scrollYProgress, [0.1, 0.4], [5, 0]);
  const mockupY = useTransform(scrollYProgress, [0.1, 0.4], [100, 0]);
  
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div ref={containerRef} className="relative min-h-[300vh] bg-[#050505] text-white selection:bg-primary selection:text-primary-foreground overflow-x-hidden font-manrope">
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
           style={{ y: bgY }}
           className="absolute inset-0 opacity-40"
        >
          <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] bg-primary/20 blur-[180px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-500/10 blur-[200px] rounded-full" />
        </motion.div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />
      </div>

      {/* Modern Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 lg:px-16">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(114,254,143,0.3)] group-hover:scale-110 transition-transform duration-500">
               <Music className="text-black h-7 w-7" />
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase italic font-epilogue">SONIQ</span>
          </div>
          
          <div className="hidden md:flex items-center gap-12 text-[11px] font-black uppercase tracking-[0.3em]">
             <Link href="#features" className="hover:text-primary transition-colors">Experience</Link>
             <Link href="#sync" className="hover:text-primary transition-colors">The Protocol</Link>
             <Link href="#community" className="hover:text-primary transition-colors">Community</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden sm:block text-[10px] font-black uppercase tracking-[0.3em] hover:text-primary transition-all">Sign In</Link>
            <Link href="/signup" className="bg-white text-black rounded-full px-10 py-4 font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:scale-110 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95 shadow-2xl">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Sections */}
      
      {/* 1. Immersive Hero */}
      <section className="relative z-10 h-screen flex flex-col items-center justify-center px-6">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="text-center max-w-6xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block mb-10 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
              The Next Editorial Standard in Audio
            </span>
            <h1 className="mb-12 font-epilogue tracking-[-0.05em]">
              Sound Together <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 drop-shadow-2xl">
                Like Never Before.
              </span>
            </h1>
            
            <p className="text-white/60 mb-16 text-xl md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
               Elite audio rooms designed for those who demand more. Perfectly synced, editorial grade, and hyper-social.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link
                href="/explore"
                className="w-full sm:w-auto bg-primary text-black px-14 py-7 rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(114,254,143,0.4)] active:scale-95 shadow-xl flex items-center gap-4"
              >
                Launch Pulse <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="w-full sm:w-auto text-[11px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-colors">
                Watch the Film
              </button>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20 pointer-events-none"
        >
           <span className="text-[9px] uppercase tracking-[0.5em] font-black">Scroll</span>
           <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </section>

      {/* 2. Product Spotlight (The Mockup) */}
      <section id="experience" className="relative z-10 min-h-screen pt-40 px-6 lg:px-16 overflow-visible">
         <div className="mx-auto max-w-7xl">
            <motion.div 
               style={{ scale: mockupScale, y: mockupY, rotateX: mockupRotate }}
               className="perspective-1000"
            >
               <div className="relative rounded-[3rem] p-4 bg-gradient-to-b from-white/10 to-transparent border border-white/5 shadow-[0_100px_200px_-50px_rgba(0,0,0,0.8)]">
                  <div className="relative rounded-[2.5rem] overflow-hidden bg-[#111] aspect-[16/10]">
                     <img 
                        src="/assets/shot.png" 
                        alt="SONIQ Elite Interface" 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-1000"
                     />
                     <div className="absolute inset-0 reflection-overlay pointer-events-none" />
                     
                     {/* Ambient Glows around the screen */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[150px] opacity-30 pointer-events-none" />
                  </div>
               </div>
            </motion.div>

            <div className="mt-40 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
               <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ margin: "-100px" }}
                  transition={{ duration: 1 }}
               >
                  <h2 className="mb-10 font-epilogue">The Protocol of <br/><span className="text-primary italic">Perfect Sync.</span></h2>
                  <p className="text-xl text-white/60 leading-relaxed font-medium">
                     We've spent thousands of hours perfecting the synchronization engine. 
                     Military-grade latency management ensures that what you hear, your friends hear. 
                     No drift, no lag, just pure audio bliss.
                  </p>
                  
                  <div className="mt-16 grid grid-cols-2 gap-12">
                     <div>
                        <span className="text-4xl font-black text-white block mb-2 font-epilogue">0.01ms</span>
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Sync Latency</span>
                     </div>
                     <div>
                        <span className="text-4xl font-black text-white block mb-2 font-epilogue">32-bit</span>
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Audio Quality</span>
                     </div>
                  </div>
               </motion.div>

               <div className="relative">
                  <div className="absolute -inset-20 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.8 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ margin: "-100px" }}
                     className="bg-white/5 border border-white/10 rounded-[3rem] p-12 relative z-10 backdrop-blur-3xl"
                  >
                     <Radio className="h-16 w-16 text-primary mb-12" />
                     <h3 className="text-3xl font-black mb-6 uppercase tracking-tight font-epilogue">Master the Stream.</h3>
                     <p className="text-white/40 font-medium leading-relaxed mb-10">
                        Take control with our intuitive Role system. Promote DJs, manage permissions, and orchestrate the perfect session.
                     </p>
                     <ul className="space-y-6">
                        {[
                           { icon: Shield, text: "Advanced Role Management" },
                           { icon: Zap, text: "Ultra-low Latency Backend" },
                           { icon: Layers, text: "Multi-layered Audio Stack" }
                        ].map((item, i) => (
                           <li key={i} className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/80">
                              <item.icon className="h-5 w-5 text-primary" />
                              {item.text}
                           </li>
                        ))}
                     </ul>
                  </motion.div>
               </div>
            </div>
         </div>
      </section>

      {/* 3. The Modern Bento Grid */}
      <section id="features" className="relative z-10 py-60 px-6 lg:px-16 bg-[#080808]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-32">
            <h2 className="mb-8 font-epilogue">Engineered for <br/> <span className="text-white/40">Excellence.</span></h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto font-medium">Every pixel, every frame, every vibration is tuned for high-fidelity listeners.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-8 h-auto md:h-[800px]">
             {/* Large Bento Item */}
             <motion.div 
               whileHover={{ scale: 0.98 }}
               className="md:col-span-4 bg-white/[0.03] border border-white/10 rounded-[3rem] p-12 overflow-hidden relative group"
             >
                <div className="absolute top-0 right-0 p-12 opacity-20 group-hover:opacity-40 transition-opacity">
                   <Globe className="h-64 w-64 text-primary" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-end">
                   <h3 className="text-4xl font-black mb-6 uppercase tracking-tight font-epilogue">Global Presence</h3>
                   <p className="text-xl text-white/40 max-w-md font-medium leading-relaxed">
                      Connect with listeners across the globe in milliseconds. Scaling from private sessions to stadium-level audiences.
                   </p>
                </div>
                <div className="absolute inset-0 sonic-shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
             </motion.div>

             {/* Vertical Bento Item */}
             <motion.div 
               whileHover={{ scale: 0.98 }}
               className="md:col-span-2 bg-primary p-12 rounded-[3rem] overflow-hidden flex flex-col justify-between relative group"
             >
                <Command className="h-16 w-16 text-black" />
                <div className="z-10">
                   <h3 className="text-3xl font-black text-black mb-4 uppercase tracking-tight font-epilogue transition-transform group-hover:-translate-y-2">Orchestration</h3>
                   <p className="text-black/60 font-bold uppercase text-[10px] tracking-[0.2em]">Full automation tools for DJs</p>
                </div>
                <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 opacity-10">
                   <Command className="h-64 w-64 text-black" />
                </div>
             </motion.div>

             {/* Small Square Bento Item */}
             <motion.div 
               whileHover={{ scale: 0.98 }}
               className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-[3rem] p-12 flex flex-col justify-center relative group"
             >
                <Share2 className="h-12 w-12 text-primary mb-8" />
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight font-epilogue">Social Grid</h3>
                <p className="text-white/40 font-medium text-sm leading-relaxed">Seamless sharing across all editorial platforms.</p>
             </motion.div>

             {/* Wide Bento Item */}
             <motion.div 
               whileHover={{ scale: 0.98 }}
               className="md:col-span-4 bg-[#111] border border-white/10 rounded-[3rem] p-12 overflow-hidden relative group"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
                <div className="relative z-10 flex h-full items-center justify-between">
                   <div className="max-w-xs">
                      <h3 className="text-3xl font-black mb-6 uppercase tracking-tight font-epilogue">Elite Gear</h3>
                      <p className="text-white/40 font-medium leading-relaxed">Optimized for high-end studio monitors and Hi-Fi setups.</p>
                   </div>
                   <Music className="h-24 w-24 text-white/5" />
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* 4. The Final Call */}
      <section id="community" className="relative z-10 py-60 px-6 text-center">
         <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
         >
            <h2 className="mb-12 font-epilogue">Ready to join <br/> <span className="text-primary italic">The Pulse?</span></h2>
            <p className="text-xl text-white/40 mb-20 max-w-2xl mx-auto font-medium">Join the most advanced audio community. Start your room in seconds.</p>
            
            <Link
               href="/signup"
               className="inline-block bg-white text-black px-16 py-8 rounded-[2rem] font-black text-sm uppercase tracking-[0.5em] transition-all hover:scale-110 hover:shadow-[0_0_80px_rgba(255,255,255,0.3)] active:scale-95"
            >
               Get Access Now
            </Link>
         </motion.div>
      </section>

      {/* Modern Footer */}
      <footer className="relative z-10 border-t border-white/5 py-32 bg-black">
        <div className="mx-auto max-w-7xl px-8 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between gap-24 mb-32">
             <div className="max-w-xs text-left">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(114,254,143,0.3)]">
                      <Music className="text-black w-7 h-7" />
                   </div>
                   <span className="font-black tracking-tighter text-3xl uppercase italic font-epilogue">SONIQ</span>
                </div>
                <p className="text-white/40 font-medium leading-relaxed">The pinnacle of shared audio. Engineered for the next generation of listeners.</p>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 gap-20">
                <div className="flex flex-col gap-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-4">Platform</p>
                   <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">Experience</Link>
                   <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">Features</Link>
                   <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">Safety</Link>
                </div>
                <div className="flex flex-col gap-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-4">Company</p>
                  <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">About</Link>
                  <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">Blog</Link>
                  <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">Careers</Link>
                </div>
                <div className="flex flex-col gap-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-4">Support</p>
                  <button onClick={() => setIsSupportOpen(true)} className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">Help Center</button>
                  <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">Terms</Link>
                  <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">Privacy</Link>
                </div>
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 pt-12 border-t border-white/5 opacity-40">
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">
               © 2026 SONIQ. DESIGNED IN SEOUL. BUILT IN SF.
             </p>
             <div className="flex items-center gap-8">
                <a href="#" className="text-[10px] font-black uppercase tracking-[0.3em]">Twitter</a>
                <a href="#" className="text-[10px] font-black uppercase tracking-[0.3em]">Instagram</a>
                <a href="#" className="text-[10px] font-black uppercase tracking-[0.3em]">LinkedIn</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

"use client";

import { ArrowRight, Sparkles, Music, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen overflow-hidden relative">
      {/* Background Decorative Gradient - Subtle & Theme Aware */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav
        className="border-border/40 sticky top-0 z-50 border-b backdrop-blur-md bg-background/70"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="from-ocean-blue to-electric-magenta flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br">
              <Music className="text-soft-white h-6 w-6" />
            </div>
            <h1 className="from-deep-purple via-electric-magenta to-neon-pink bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
              SONIQ
            </h1>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-foreground hover:text-primary px-6 py-2 transition-colors duration-300 font-bold"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground rounded-xl px-6 py-2 font-black uppercase tracking-widest text-xs transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="border-primary/20 bg-primary/5 mb-6 inline-block rounded-full border px-4 py-2">
              <span className="text-primary flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                The Future of Shared Music
              </span>
            </div>
            <h2 className="mb-6 text-6xl leading-tight font-black text-foreground tracking-tighter">
              Listen Together <br />
              <span className="text-primary">
                in Music Rooms
              </span>
            </h2>
            <p className="text-muted-foreground mb-8 text-xl leading-relaxed font-medium">
              Enjoy live music with people from around the world in shared
              listening spaces. Create rooms, discover trending vibes, and
              connect with music lovers instantly.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/explore"
                className="bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-2xl px-10 py-5 font-black uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 active:scale-95"
              >
                Explore Rooms
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/signup"
                className="border-border bg-card text-foreground hover:bg-muted flex items-center justify-center rounded-2xl border px-10 py-5 font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-sm"
              >
                Create Your Room
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="from-deep-purple/20 to-electric-magenta/20 absolute inset-0 rounded-3xl bg-gradient-to-r blur-3xl" />
            <div
              className="border-border relative overflow-hidden rounded-3xl border shadow-2xl bg-card"
            >
              <img
                src="/images/image.png"
                alt="Listen Together"
                className="h-auto w-full dark:opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h3 className="mb-16 text-center text-4xl font-bold">
          Why Choose SONIQ?
        </h3>
        <div className="grid gap-8 md:grid-cols-3">
          <div
            className="border-border rounded-3xl border p-10 bg-card shadow-sm hover:shadow-md transition-all group"
          >
            <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
              <Music className="h-7 w-7" />
            </div>
            <h4 className="mb-4 text-2xl font-black text-foreground tracking-tight">Explore Rooms</h4>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Browse and join live rooms with different vibes and genres.
              Discover trending sounds and connect with music lovers.
            </p>
          </div>

          <div
            className="border-electric-magenta/30 rounded-2xl border p-8"
            style={{
              background: "rgba(26, 22, 51, 0.6)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="from-electric-magenta to-neon-pink mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br">
              <Zap className="text-midnight-black h-6 w-6" />
            </div>
            <h4 className="mb-3 text-xl font-bold">Stay in Background</h4>
            <p className="text-muted-foreground">
              Keep your music playing even when you're using other apps. Perfect
              for multitasking without interruptions.
            </p>
          </div>

          <div
            className="border-deep-purple/30 rounded-2xl border p-8"
            style={{
              background: "rgba(26, 22, 51, 0.6)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="from-neon-pink to-neon-cyan mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br">
              <Users className="text-midnight-black h-6 w-6" />
            </div>
            <h4 className="mb-3 text-xl font-bold">Create Your Room</h4>
            <p className="text-muted-foreground">
              Build your own listening space and share music with others. Set
              the mood and become a DJ in your community.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div
          className="border-border rounded-[40px] border p-16 text-center bg-card shadow-xl relative overflow-hidden"
        >
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />

          <h3 className="mb-6 text-5xl font-black text-foreground tracking-tighter">Ready to Share Music?</h3>
          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed">
            Join thousands of music lovers in real-time listening experiences.
            No setup required, just vibe together.
          </p>
          <Link
            href="/signup"
            className="bg-primary text-primary-foreground inline-block rounded-2xl px-12 py-5 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 active:scale-95"
          >
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-deep-purple/20 text-muted-foreground border-t px-4 py-8 text-center">
        <p>© 2025 SONIQ. Premium Real-Time Social Music Platform.</p>
      </footer>
    </main>
  );
}

"use client";

import { ArrowRight, Sparkles, Music, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="from-midnight-black via-deep-navy to-midnight-black text-soft-white min-h-screen overflow-hidden bg-gradient-to-b">
      {/* Navigation */}
      <nav
        className="border-deep-purple/20 sticky top-0 z-50 border-b"
        style={{
          backdropFilter: "blur(10px)",
          background: "rgba(15, 11, 36, 0.7)",
        }}
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
              className="text-soft-white hover:text-electric-magenta px-6 py-2 transition-colors duration-300"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="from-deep-purple to-electric-magenta text-soft-white rounded-lg bg-gradient-to-r px-6 py-2 font-semibold transition-all duration-300 hover:shadow-lg"
              style={{ boxShadow: "0 0 20px rgba(108, 43, 217, 0.3)" }}
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
            <div className="border-electric-magenta/30 bg-electric-magenta/5 mb-6 inline-block rounded-full border px-4 py-2">
              <span className="text-electric-magenta flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                The Future of Shared Music
              </span>
            </div>
            <h2 className="mb-6 text-6xl leading-tight font-bold">
              <span className="from-deep-purple via-electric-magenta to-neon-pink bg-gradient-to-r bg-clip-text text-transparent">
                Listen Together
              </span>
              <br />
              in Music Rooms
            </h2>
            <p className="text-muted-foreground mb-8 text-xl leading-relaxed">
              Enjoy live music with people from around the world in shared
              listening spaces. Create rooms, discover trending vibes, and
              connect with music lovers instantly.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/explore"
                className="from-deep-purple to-electric-magenta text-soft-white flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-8 py-4 font-bold transition-all duration-300 hover:shadow-2xl"
                style={{ boxShadow: "0 0 30px rgba(108, 43, 217, 0.3)" }}
              >
                Explore Rooms
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/signup"
                className="border-electric-magenta/50 text-soft-white hover:bg-electric-magenta/10 flex items-center justify-center rounded-xl border px-8 py-4 font-bold transition-all duration-300"
              >
                Create Your Room
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="from-deep-purple/20 to-electric-magenta/20 absolute inset-0 rounded-3xl bg-gradient-to-r blur-3xl" />
            <div
              className="border-electric-magenta/30 relative overflow-hidden rounded-3xl border"
              style={{
                background: "rgba(26, 22, 51, 0.4)",
                backdropFilter: "blur(10px)",
              }}
            >
              <img
                src="/images/image.png"
                alt="Listen Together"
                className="h-auto w-full"
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
            className="border-deep-purple/30 rounded-2xl border p-8"
            style={{
              background: "rgba(26, 22, 51, 0.6)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="from-ocean-blue to-neon-cyan mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br">
              <Music className="text-midnight-black h-6 w-6" />
            </div>
            <h4 className="mb-3 text-xl font-bold">Explore Rooms</h4>
            <p className="text-muted-foreground">
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
          className="border-electric-magenta/40 rounded-3xl border p-12 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(108, 43, 217, 0.1) 0%, rgba(214, 93, 242, 0.05) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <h3 className="mb-4 text-4xl font-bold">Ready to Share Music?</h3>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
            Join thousands of music lovers in real-time listening experiences.
            No setup required, just vibe together.
          </p>
          <Link
            href="/signup"
            className="from-deep-purple to-electric-magenta text-soft-white inline-block rounded-xl bg-gradient-to-r px-10 py-4 text-lg font-bold transition-all duration-300 hover:shadow-2xl"
            style={{ boxShadow: "0 0 30px rgba(108, 43, 217, 0.3)" }}
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

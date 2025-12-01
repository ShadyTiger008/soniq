"use client";

import { useState } from "react";
import { Search, Headphones, Moon, Heart, PartyPopper, Coffee, Users, Music2 } from "lucide-react";
import { RoomCard } from "@frontend/components/room-card";
import { BottomNowPlaying } from "@frontend/components/bottom-now-playing";
import Link from "next/link";

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("Featured");
  const [selectedMood, setSelectedMood] = useState("Focus");

  const categories = ["Featured", "Trending", "Lofi", "Study", "Party", "Chill", "Romance", "Gaming"];

  const liveNowRooms = [
    {
      id: "live1",
      title: "Lofi Chill Vibes",
      host: "DJ Zen",
      listeners: 1245,
      thumbnail: "/api/placeholder/400/300",
      mood: "Chill",
    },
    {
      id: "live2",
      title: "Euphoria Grooves",
      host: "Sound Master",
      listeners: 892,
      thumbnail: "/api/placeholder/400/300",
      mood: "Party",
    },
    {
      id: "live3",
      title: "Deep Focus",
      host: "Study Gang",
      listeners: 654,
      thumbnail: "/api/placeholder/400/300",
      mood: "Study",
    },
  ];

  const trendingRooms = [
    {
      id: "trend1",
      title: "Late Night Beats",
      host: "Subham",
      listeners: 42,
      avatars: ["👤", "🎧", "🎵", "🎶"],
      mood: "Party",
      timeAgo: "8 min",
    },
    {
      id: "trend2",
      title: "Feel-Good Tunes",
      host: "DJ Alex",
      listeners: 38,
      avatars: ["👤", "🎧", "🎵", "🎶"],
      mood: "Chill",
      timeAgo: "15 min",
    },
    {
      id: "trend3",
      title: "Shill Indie Jams",
      host: "Subham",
      listeners: 42,
      avatars: ["👤", "🎧", "🎵", "🎶"],
      mood: "Indie",
      timeAgo: "15 min",
    },
  ];

  const moods = [
    { id: "Focus", icon: Headphones, label: "Focus" },
    { id: "Sleep", icon: Moon, label: "Sleep", emoji: "😴" },
    { id: "Study", icon: Heart, label: "Study" },
    { id: "Party", icon: PartyPopper, label: "Party" },
    { id: "Chill", icon: Coffee, label: "Chill", emoji: "😎" },
    { id: "Romance", icon: Coffee, label: "Romance" },
    { id: "Coffee", icon: Coffee, label: "Coffee" },
  ];

  const newRooms = [
    { id: "new1", title: "Fresh Beats Lab", listeners: 8 },
    { id: "new2", title: "Chillwave Escape", listeners: 16 },
    { id: "new3", title: "Beats & Beyond", listeners: 23 },
  ];

  return (
    <div className="from-midnight-black via-deep-navy to-midnight-black text-soft-white min-h-screen bg-gradient-to-b pb-32">
      {/* Header Section */}
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8">
        <div
          className="relative mx-auto max-w-3xl rounded-3xl border-2 p-8 text-center"
          style={{
            borderImage: "linear-gradient(135deg, #6C2BD9, #D65DF2, #ff006e) 1",
            background:
              "linear-gradient(135deg, rgba(108, 43, 217, 0.1) 0%, rgba(214, 93, 242, 0.05) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h1 className="mb-3 text-5xl font-bold text-white">Explore Rooms</h1>
          <p className="text-muted-foreground text-lg">
            Join live music rooms, discover trending vibes, and connect with people listening right now.
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mx-auto max-w-7xl px-4 pb-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`smooth-transition whitespace-nowrap rounded-xl px-6 py-3 font-semibold ${
                selectedCategory === category
                  ? "from-deep-purple to-electric-magenta text-soft-white bg-gradient-to-r shadow-lg shadow-electric-magenta/30"
                  : "glass-card hover:border-electric-magenta text-muted-foreground hover:text-soft-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Live Now Rooms */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-soft-white mb-2 flex items-center gap-2 text-2xl font-bold">
            <span className="text-2xl">🔥</span>
            Live Now
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {liveNowRooms.map((room) => (
            <div
              key={room.id}
              className="glass-card group relative overflow-hidden rounded-2xl"
            >
              {/* Room Image */}
              <div className="from-deep-purple to-ocean-blue relative aspect-[4/3] overflow-hidden bg-gradient-to-br">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Music2 className="text-muted-foreground h-24 w-24 opacity-20" />
                </div>
                {/* Live Now Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1.5 backdrop-blur-sm">
                  <div className="bg-white h-2 w-2 animate-pulse rounded-full" />
                  <span className="font-600 text-xs text-white">Live Now 🔥</span>
                </div>
                {/* Join Button Overlay */}
                <div className="from-midnight-black/90 smooth-transition absolute inset-0 flex items-end bg-gradient-to-t to-transparent p-4 opacity-0 group-hover:opacity-100">
                  <button className="from-deep-purple to-electric-magenta hover:from-electric-magenta hover:to-neon-pink text-soft-white w-full rounded-lg bg-gradient-to-r px-6 py-3 font-bold transition-all duration-300">
                    Join Room
                  </button>
                </div>
              </div>
              {/* Room Info */}
              <div className="p-4">
                <h3 className="font-heading font-700 text-soft-white mb-1 text-lg">
                  {room.title}
                </h3>
                <p className="text-muted-foreground mb-3 text-sm">By {room.host}</p>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Users className="h-3 w-3" />
                    {room.listeners.toLocaleString()} listening
                  </span>
                  <span className="text-electric-magenta border-electric-magenta/20 rounded-full border bg-[rgba(214,93,242,0.1)] px-2 py-1 text-xs">
                    {room.mood}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Rooms */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-soft-white mb-2 flex items-center gap-2 text-2xl font-bold">
            <span className="text-2xl">🔥</span>
            Trending Rooms
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {trendingRooms.map((room) => (
            <div
              key={room.id}
              className="glass-card hover:border-electric-magenta smooth-transition group rounded-xl p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-heading font-600 text-soft-white mb-1 text-base">
                    {room.title}
                  </h3>
                  <p className="text-muted-foreground text-xs">{room.host}</p>
                </div>
              </div>
              <div className="mb-3 flex items-center gap-2">
                {room.avatars?.map((avatar, idx) => (
                  <div
                    key={idx}
                    className="from-deep-purple to-electric-magenta flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r text-xs"
                  >
                    {avatar}
                  </div>
                ))}
                {/* Waveform Visualizer */}
                <div className="ml-auto flex h-8 items-end gap-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="from-deep-purple to-electric-magenta w-1 rounded-full bg-gradient-to-t"
                      style={{
                        height: `${10 + i * 2}px`,
                        animation: `waveform ${0.5 + i * 0.1}s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  {room.listeners} listening
                </span>
                <span className="text-muted-foreground text-xs">{room.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rooms by Mood */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-soft-white mb-2 flex items-center gap-2 text-2xl font-bold">
            <span className="text-2xl">🍃</span>
            Rooms by Mood
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {moods.map((mood) => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`smooth-transition flex min-w-[120px] flex-col items-center gap-2 rounded-xl p-4 ${
                  selectedMood === mood.id
                    ? "from-deep-purple to-electric-magenta bg-gradient-to-r text-soft-white shadow-lg shadow-electric-magenta/30"
                    : "glass-card hover:border-electric-magenta text-muted-foreground hover:text-soft-white"
                }`}
              >
                {mood.emoji ? (
                  <span className="text-3xl">{mood.emoji}</span>
                ) : (
                  <Icon className="h-8 w-8" />
                )}
                <span className="font-500 text-sm">{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* New & Rising Rooms */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-soft-white mb-2 flex items-center gap-2 text-2xl font-bold">
            <span className="text-2xl">✨</span>
            New & Rising Rooms
          </h2>
        </div>
        <div className="space-y-3">
          {newRooms.map((room) => (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className="glass-card hover:border-electric-magenta smooth-transition group flex items-center justify-between rounded-xl p-4"
            >
              <div>
                <h3 className="font-heading font-600 text-soft-white mb-1 text-base">
                  {room.title}
                </h3>
                <p className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Users className="h-3 w-3" />
                  {room.listeners} listeners
                </p>
              </div>
              <button className="from-deep-purple to-electric-magenta text-soft-white smooth-transition rounded-lg bg-gradient-to-r px-4 py-2 text-sm font-semibold opacity-0 group-hover:opacity-100">
                Join
              </button>
            </Link>
          ))}
        </div>
      </div>

      <BottomNowPlaying />
    </div>
  );
}

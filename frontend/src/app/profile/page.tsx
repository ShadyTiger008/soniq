"use client";

import { useState, useEffect } from "react";
import { Upload, Edit2, Award, Music, TrendingUp, Share2 } from "lucide-react";
import { useAuth } from "@frontend/lib/auth-context";
import { apiClient } from "@frontend/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile");
    } else if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, authLoading]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        setUserData(response.data);
      } else {
        toast.error(response.error || "Failed to load profile");
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading || !isAuthenticated) {
    return (
      <div className="from-midnight-black via-deep-navy to-midnight-black flex min-h-screen items-center justify-center bg-gradient-to-b">
        <div className="border-soft-white h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  const userStats = {
    username: userData?.username || user?.username || "User",
    email: userData?.email || user?.email || "",
    hoursListened: 247, // TODO: Calculate from user activity
    roomsCreated: 12, // TODO: Get from user's rooms
    djRating: 4.8, // TODO: Calculate from ratings
    followers: 324, // TODO: Get from user's followers
    achievements: 8,
  };

  const achievements = [
    {
      id: 1,
      title: "First Room",
      description: "Created your first room",
      icon: "🎵",
    },
    {
      id: 2,
      title: "Century Listener",
      description: "100 hours listened",
      icon: "🎧",
    },
    {
      id: 3,
      title: "Social Butterfly",
      description: "50 rooms visited",
      icon: "🦋",
    },
    { id: 4, title: "DJ Star", description: "Hosted 10 rooms", icon: "⭐" },
    { id: 5, title: "Trendsetter", description: "1,000 followers", icon: "🔥" },
    {
      id: 6,
      title: "Night Owl",
      description: "Listened between midnight-5am",
      icon: "🌙",
    },
    {
      id: 7,
      title: "Music Curator",
      description: "Maintained 100+ queue requests",
      icon: "📚",
    },
    {
      id: 8,
      title: "Community Hero",
      description: "Moderated 5+ rooms",
      icon: "🛡️",
    },
  ];

  return (
    <div className="from-midnight-black via-deep-navy to-midnight-black text-soft-white min-h-screen bg-gradient-to-b">
      {/* Header */}
      <div className="glass-card border-b border-[rgba(108,43,217,0.2)]">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6 flex items-start gap-6">
            {/* Avatar */}
            <div className="group relative">
              <div className="from-deep-purple to-electric-magenta flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-4xl">
                {userData?.avatar ? (
                  <img src={userData.avatar} alt={userStats.username} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span>{userStats.username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button className="from-deep-purple to-electric-magenta text-soft-white hover:from-electric-magenta hover:to-neon-pink smooth-transition absolute right-0 bottom-0 rounded-full bg-gradient-to-r p-2 opacity-0 group-hover:opacity-100">
                <Upload className="h-4 w-4" />
              </button>
            </div>

            {/* User info */}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="font-heading text-soft-white text-3xl font-extrabold">
                  {userStats.username}
                </h1>
                <Link
                  href="/settings"
                  className="smooth-transition rounded-lg p-2 hover:bg-[rgba(108,43,217,0.2)]"
                >
                  <Edit2 className="text-muted-foreground h-5 w-5" />
                </Link>
              </div>
              <p className="text-muted-foreground mb-4">{userStats.email}</p>

              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="glass-card rounded-lg p-3 text-center">
                  <p className="font-700 text-electric-magenta text-xl">
                    {userStats.followers}
                  </p>
                  <p className="text-muted-foreground text-xs">Followers</p>
                </div>
                <div className="glass-card rounded-lg p-3 text-center">
                  <p className="font-700 text-ocean-blue text-xl">
                    {userStats.roomsCreated}
                  </p>
                  <p className="text-muted-foreground text-xs">Rooms</p>
                </div>
                <div className="glass-card rounded-lg p-3 text-center">
                  <p className="font-700 text-neon-cyan text-xl">
                    {userStats.hoursListened}
                  </p>
                  <p className="text-muted-foreground text-xs">Hours</p>
                </div>
                <div className="glass-card rounded-lg p-3 text-center">
                  <p className="font-700 text-neon-pink text-xl">
                    ⭐{userStats.djRating}
                  </p>
                  <p className="text-muted-foreground text-xs">DJ Rating</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button className="from-deep-purple to-electric-magenta text-soft-white font-600 hover:from-electric-magenta hover:to-neon-pink smooth-transition neon-glow rounded-lg bg-gradient-to-r px-4 py-2">
                Follow
              </button>
              <button className="glass-card hover:border-ocean-blue text-soft-white font-600 smooth-transition flex items-center gap-2 rounded-lg px-4 py-2">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Stats cards */}
        <section className="mb-12">
          <h2 className="font-heading font-700 text-soft-white mb-4 flex items-center gap-2 text-lg">
            <TrendingUp className="text-ocean-blue h-5 w-5" />
            Your Statistics
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="glass-card rounded-xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <Music className="text-electric-magenta h-6 w-6" />
                <h3 className="font-600 text-soft-white">Hours Listened</h3>
              </div>
              <p className="font-700 text-electric-magenta mb-2 text-3xl">
                {userStats.hoursListened}h
              </p>
              <p className="text-muted-foreground text-sm">
                Your total listening time
              </p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <TrendingUp className="text-ocean-blue h-6 w-6" />
                <h3 className="font-600 text-soft-white">Rooms Created</h3>
              </div>
              <p className="font-700 text-ocean-blue mb-2 text-3xl">
                {userStats.roomsCreated}
              </p>
              <p className="text-muted-foreground text-sm">
                Communities you've hosted
              </p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <Award className="text-neon-cyan h-6 w-6" />
                <h3 className="font-600 text-soft-white">DJ Rating</h3>
              </div>
              <p className="font-700 text-neon-cyan mb-2 text-3xl">
                ⭐{userStats.djRating}
              </p>
              <p className="text-muted-foreground text-sm">
                From {Math.floor(userStats.hoursListened * 1.5)} listeners
              </p>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section>
          <h2 className="font-heading font-700 text-soft-white mb-4 flex items-center gap-2 text-lg">
            <Award className="text-neon-pink h-5 w-5" />
            Achievements ({userStats.achievements}/8)
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="glass-card hover:border-electric-magenta/50 smooth-transition group cursor-pointer rounded-lg p-4 text-center"
              >
                <div className="smooth-transition mb-2 text-4xl group-hover:scale-110">
                  {achievement.icon}
                </div>
                <h3 className="font-600 text-soft-white mb-1 text-sm">
                  {achievement.title}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

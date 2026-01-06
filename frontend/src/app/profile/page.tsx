"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Edit2, Save, X, Camera, Music2, Users, Loader2, Link as LinkIcon } from "lucide-react";
import { AppShell } from "@frontend/components/layout/app-shell";
import { apiClient } from "@frontend/lib/api-client";
import { toast } from "sonner";
import { cn } from "@frontend/lib/utils";
import { useAuth } from "@frontend/lib/auth-context";
import { UnsplashImagePicker } from "@frontend/components/ui/unsplash-picker";
import Link from "next/link";
import { format } from "date-fns";
import type { Room } from "@frontend/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    avatar: "",
    createdAt: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getCurrentUser();
        if (response.success && response.data) {
          const userData = response.data;
          setFormData({
            username: userData.username || "",
            email: userData.email || "",
            avatar: userData.avatar || "",
            createdAt: userData.createdAt || new Date().toISOString(),
          });
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    fetchMyRooms();
  }, []);

  const fetchMyRooms = async () => {
    setRoomsLoading(true);
    try {
      const response = await apiClient.getMyRooms();
      if (response.success && response.data) {
        setMyRooms(response.data);
      }
    } catch (error) {
      console.error("Failed to load rooms", error);
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    try {
      const response = await apiClient.updateUser({
        username: formData.username,
        email: formData.email,
        avatar: formData.avatar
      });
      
      if (response.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        // Optimistically update local state if needed, but we essentially just did
      } else {
        toast.error(response.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-5xl p-6 pb-32 space-y-10">
        
        {/* Profile Header Block */}
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border shadow-sm">
          {/* Decorative Banner Background */}
          <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/5 to-background w-full relative">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
          </div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start -mt-16 relative">
              {/* Avatar Section */}
              <div className="relative group shrink-0">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-background p-1.5 shadow-xl ring-1 ring-border/50">
                  <div className="h-full w-full rounded-full overflow-hidden bg-muted flex items-center justify-center relative">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                         <User className="h-16 w-16 text-primary/40" />
                      </div>
                    )}
                    
                    {isEditing && (
                      <button 
                        onClick={() => setShowPicker(!showPicker)}
                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                      >
                        <Camera className="h-6 w-6 mb-1" />
                        <span className="text-xs font-bold">Change</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Info & Actions */}
              <div className="flex-1 pt-0 md:pt-16 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{formData.username}</h1>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm font-medium">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {formData.email}
                      </div>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5">
                         <Calendar className="h-3.5 w-3.5" />
                         <span>Joined {formData.createdAt ? format(new Date(formData.createdAt), "MMMM yyyy") : "Recently"}</span>
                      </div>
                    </div>
                  </div>

                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-all font-bold text-sm"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button 
                        onClick={handleUpdate}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit Form Area */}
                {isEditing && (
                  <div className="mt-8 p-6 bg-muted/30 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display Name</label>
                        <input 
                          type="text" 
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Your display name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-muted border border-border rounded-xl px-4 py-3 font-medium text-muted-foreground outline-none cursor-not-allowed"
                          disabled
                        />
                        <p className="text-[10px] text-muted-foreground px-1">Email cannot be changed directly.</p>
                      </div>
                      
                      {/* Avatar URL Input (Fallback/Direct) */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avatar Image</label>
                         <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <input 
                                  type="text" 
                                  value={formData.avatar}
                                  onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                                  className="w-full bg-background border border-border rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm pl-10"
                                  placeholder="https://..."
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <LinkIcon className="h-4 w-4" />
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPicker(!showPicker)}
                                className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all border border-border ${showPicker ? 'bg-primary/10 text-primary border-primary/20' : 'bg-background hover:bg-muted'}`}
                            >
                                {showPicker ? 'Close Library' : 'Browse Library'}
                            </button>
                         </div>
                      </div>
                    </div>
                    
                    {showPicker && (
                      <div className="mt-4 p-4 bg-background rounded-xl border border-border shadow-inner">
                        <UnsplashImagePicker 
                          onSelect={(url) => {
                            setFormData(prev => ({ ...prev, avatar: url }));
                            setShowPicker(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* My Rooms Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Music2 className="h-6 w-6 text-primary" />
              My Rooms
            </h2>
            <Link 
               href="/" 
               className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              Create New Room &rarr;
            </Link>
          </div>

          {roomsLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-muted/40 animate-pulse border border-border/50" />
                ))}
             </div>
          ) : myRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRooms.map((room) => (
                <Link
                  key={room._id}
                  href={`/room/${room._id}`}
                  className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/50"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    {room.cover ? (
                       <img src={room.cover} alt={room.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/5">
                        <Music2 className="h-12 w-12 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-white">
                        {room.mood || "Chill"}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-1 truncate">{room.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
                        {room.description || "No description provided."}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-border pt-4">
                       <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          <Users className="h-3.5 w-3.5" />
                          {room.listenerCount || 0} Listeners
                       </div>
                       <div className="text-xs font-bold text-primary">
                          {room.isPrivate ? "Private Room" : "Public Room"}
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-3xl border border-dashed border-border bg-muted/20">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                 <Music2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-1">No rooms yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                You haven't created any rooms yet. Start your own room to listen with friends!
              </p>
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow transition-all hover:bg-primary/90 hover:scale-105"
              >
                Create Room
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

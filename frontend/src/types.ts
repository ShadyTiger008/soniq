export interface Song {
  id?: string;
  videoId: string;
  title: string;
  artist: string;
  duration: string | number;
  thumbnail?: string;
  requestedBy?: string; // Username
  requestedById?: string; // User ID
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  currentSong: Song | null;
  queue: Song[];
  duration: number; // in seconds
  isBuffering: boolean;
  isSyncing: boolean;
  shuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  requests: Song[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: string;
  roomId?: string; // Optional as UI might not need it, but socket provides it
}

export interface RoomMember {
  _id?: string;
  id?: string;
  username: string;
  email?: string;
  avatar?: string;
  isHost?: boolean;
  role?: 'host' | 'dj' | 'listener' | string;
}

export interface Room {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  mood?: string;
  cover?: string;
  isPrivate: boolean;
  maxListeners: number;
  hostId: string | RoomMember;
  listeners?: string[] | RoomMember[]; // Depending on backend, might be IDs or objects
  currentSong?: Song;
  queue?: Song[];
  songRequests?: Song[];
  listenerCount: number;
  createdAt?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

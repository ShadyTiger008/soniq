import mongoose, { Schema, Document } from "mongoose";

export interface IPlaylist extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  mood?: string;
  userInput: {
    mood?: string;
    activity?: string;
    energy?: number;
    genres?: string[];
    era?: string;
    language?: string;
    vibe?: string;
    length?: number;
  };
  tracks: Array<{
    videoId: string;
    title: string;
    artist: string;
    duration: number;
    thumbnail?: string;
  }>;
  isPublic: boolean;
  playCount: number;
  cacheKey?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const playlistSchema = new Schema<IPlaylist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    mood: {
      type: String,
    },
    userInput: {
      mood: String,
      activity: String,
      energy: Number,
      genres: [String],
      era: String,
      language: String,
      vibe: String,
      length: Number,
    },
    tracks: [
      {
        videoId: { type: String, required: true },
        title: { type: String, required: true },
        artist: { type: String, required: true },
        duration: { type: Number, required: true },
        thumbnail: String,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    playCount: {
      type: Number,
      default: 0,
    },
    cacheKey: {
      type: String,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index for automatic cleanup of cached playlists
playlistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PlaylistModel = mongoose.model<IPlaylist>("Playlist", playlistSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  name: string;
  description?: string;
  hostId: mongoose.Types.ObjectId;
  mood: string;
  isPrivate: boolean;
  inviteCode?: string;
  maxListeners: number;
  listenerCount: number;
  members: mongoose.Types.ObjectId[];
  roles: Map<string, "host" | "dj" | "listener">;
  permissions: {
    playPause: "everyone" | "dj" | "host";
    skip: "everyone" | "dj" | "host";
    volume: "everyone" | "dj" | "host";
    addToQueue: "everyone" | "dj" | "host";
  };
  currentSong?: {
    videoId: string;
    title: string;
    artist: string;
    duration: number;
    thumbnail?: string;
  };
  playerState?: {
    isPlaying: boolean;
    currentTime: number;
    volume: number;
    shuffle: boolean;
    repeatMode: 'none' | 'one' | 'all';
    lastUpdated: Date;
  };
  queue: Array<{
    videoId: string;
    title: string;
    artist: string;
    duration: number;
    thumbnail?: string;
    requestedBy: mongoose.Types.ObjectId;
  }>;
  songRequests: Array<{
    videoId: string;
    title: string;
    artist: string;
    duration: number;
    thumbnail?: string;
    requestedBy: mongoose.Types.ObjectId;
    requestedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    mood: {
      type: String,
      default: "Chill",
      enum: [
        "Chill",
        "Lofi",
        "Party",
        "Study",
        "Focus",
        "Ambient",
        "Romance",
        "Gaming"
      ]
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true
    },
    maxListeners: {
      type: Number,
      default: 1000,
      min: 1,
      max: 10000
    },
    listenerCount: {
      type: Number,
      default: 0,
      min: 0
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    roles: {
      type: Map,
      of: String,
      default: {}
    },
    permissions: {
      playPause: {
        type: String,
        enum: ["everyone", "dj", "host"],
        default: "everyone"
      },
      skip: {
        type: String,
        enum: ["everyone", "dj", "host"],
        default: "everyone"
      },
      volume: {
        type: String,
        enum: ["everyone", "dj", "host"],
        default: "everyone"
      },
      addToQueue: {
        type: String,
        enum: ["everyone", "dj", "host"],
        default: "everyone"
      }
    },
    currentSong: {
      videoId: String,
      title: String,
      artist: String,
      duration: Number,
      thumbnail: String
    },
    playerState: {
      isPlaying: {
        type: Boolean,
        default: false
      },
      currentTime: {
        type: Number,
        default: 0
      },
      volume: {
        type: Number,
        default: 80,
        min: 0,
        max: 100
      },
      shuffle: {
        type: Boolean,
        default: false
      },
      repeatMode: {
        type: String,
        enum: ['none', 'one', 'all'],
        default: 'none'
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    },
    queue: [
      {
        videoId: String,
        title: String,
        artist: String,
        duration: Number,
        thumbnail: String,
        requestedBy: {
          type: Schema.Types.ObjectId,
          ref: "User"
        }
      }
    ],
    songRequests: [
      {
        videoId: String,
        title: String,
        artist: String,
        duration: Number,
        thumbnail: String,
        requestedBy: {
          type: Schema.Types.ObjectId,
          ref: "User"
        },
        requestedAt: {
            type: Date,
            default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Generate invite code before saving
roomSchema.pre("save", function (next) {
  if (this.isPrivate && !this.inviteCode) {
    this.inviteCode = `SONIQ-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
  }
  next();
});

export const RoomModel = mongoose.model<IRoom>("Room", roomSchema);

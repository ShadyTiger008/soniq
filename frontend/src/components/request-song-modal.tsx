"use client";

import { useState } from "react";
import { Search, X, Clock } from "lucide-react";

interface RequestSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (query: string) => void;
}

export function RequestSongModal({
  isOpen,
  onClose,
  onSubmit,
}: RequestSongModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([
    { id: "1", title: "Song Title 1", artist: "Artist Name", duration: "3:45" },
    { id: "2", title: "Song Title 2", artist: "Artist Name", duration: "4:12" },
    { id: "3", title: "Song Title 3", artist: "Artist Name", duration: "3:28" },
  ]);

  const handleRequestSong = (songId: string) => {
    console.log(`Requested song: ${songId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="glass-card relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl sm:w-full sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(108,43,217,0.2)] p-4">
          <h2 className="font-heading font-700 text-soft-white text-xl">
            Request a Song
          </h2>
          <button
            onClick={onClose}
            className="smooth-transition rounded-lg p-2 hover:bg-[rgba(108,43,217,0.2)]"
          >
            <X className="text-muted-foreground h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-[rgba(108,43,217,0.2)] p-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-3.5 left-3 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by song title or artist..."
              autoFocus
              className="text-soft-white placeholder-muted-foreground focus:border-electric-magenta focus:ring-electric-magenta smooth-transition w-full rounded-lg border border-[rgba(108,43,217,0.3)] bg-[rgba(26,22,51,0.6)] py-3 pr-4 pl-10 focus:ring-1 focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {results.map((song) => (
            <button
              key={song.id}
              onClick={() => handleRequestSong(song.id)}
              className="glass-card hover:border-electric-magenta smooth-transition group w-full rounded-lg p-3 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-600 text-soft-white group-hover:text-electric-magenta smooth-transition">
                    {song.title}
                  </p>
                  <p className="text-muted-foreground text-sm">{song.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm">
                    {song.duration}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-muted-foreground border-t border-[rgba(108,43,217,0.2)] p-4 text-center text-sm">
          You have requested {3} songs today
        </div>
      </div>
    </div>
  );
}

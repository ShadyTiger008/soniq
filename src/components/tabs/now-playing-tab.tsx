interface Song {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail?: string;
}

interface NowPlayingTabProps {
  currentSong?: Song | null;
}

export function NowPlayingTab({ currentSong }: NowPlayingTabProps) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="glass-card mb-4 rounded-xl p-6">
        <div className="from-deep-purple to-ocean-blue mb-4 aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br">
          {currentSong?.thumbnail ? (
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl">🎵</span>
            </div>
          )}
        </div>
        <h3 className="font-heading font-700 text-soft-white mb-2 text-lg">
          {currentSong?.title || "No song playing"}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {currentSong?.artist || "Select a song to start playing"}
        </p>
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs">
            Duration: {currentSong?.duration || "0:00"}
          </p>
          <p className="text-muted-foreground text-xs">Listeners: 1,234</p>
        </div>
      </div>
    </div>
  );
}

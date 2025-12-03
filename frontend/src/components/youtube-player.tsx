"use client";

import { useEffect, useRef, useState } from "react";

interface YouTubePlayerProps {
  videoId: string | null;
  isPlaying: boolean;
  volume: number;
  onStateChange?: (state: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onReady?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubePlayer({
  videoId,
  isPlaying,
  volume,
  onStateChange,
  onTimeUpdate,
  onReady,
  onError,
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsAPIReady(true);
      };
    } else {
      setIsAPIReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isAPIReady || !containerRef.current) return;

    const initializePlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      if (!videoId) {
        return;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
            // Store player reference globally for external access
            (window as any).youtubePlayer = event.target;
            onReady?.();
          },
          onStateChange: (event: any) => {
            onStateChange?.(event.data);
          },
          onError: (event: any) => {
            onError?.(`Error: ${event.data}`);
          },
        },
      });
    };

    initializePlayer();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
      }
    };
  }, [isAPIReady, videoId]);

  useEffect(() => {
    if (!playerRef.current) return;

    // Wait a bit for player to be ready
    const timeoutId = setTimeout(() => {
      try {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (e) {
        console.error("Error controlling playback:", e);
        // Retry if player not ready
        setTimeout(() => {
          try {
            if (isPlaying) {
              playerRef.current?.playVideo();
            } else {
              playerRef.current?.pauseVideo();
            }
          } catch (err) {
            console.error("Retry playback control failed:", err);
          }
        }, 500);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isPlaying]);

  useEffect(() => {
    if (!playerRef.current) return;

    try {
      playerRef.current.setVolume(volume);
    } catch (e) {
      console.error("Error setting volume:", e);
    }
  }, [volume]);

  useEffect(() => {
    if (!playerRef.current) return;

    // Update time more frequently for smoother playback (every 500ms)
    intervalRef.current = setInterval(() => {
      try {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (
          currentTime !== undefined &&
          currentTime !== null &&
          duration &&
          duration > 0
        ) {
          onTimeUpdate?.(currentTime, duration);
        }
      } catch (e) {
        // Ignore errors (player might not be ready)
      }
    }, 500); // Update every 500ms for smoother updates

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [onTimeUpdate]);

  // Expose player methods
  useEffect(() => {
    if (playerRef.current) {
      (window as any).youtubePlayer = playerRef.current;
    }
  }, [playerRef.current]);

  if (!videoId) {
    return (
      <div className="from-deep-purple to-ocean-blue flex h-full w-full items-center justify-center bg-gradient-to-br">
        <div className="text-center">
          <p className="text-muted-foreground mb-2 text-lg">
            No video selected
          </p>
          <p className="text-muted-foreground text-sm">
            Search and select a song to start playing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

// Helper function to extract video ID from YouTube URL
export function extractVideoId(urlOrId: string): string | null {
  if (!urlOrId) return null;

  // If it's already a video ID (11 characters)
  if (urlOrId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(urlOrId)) {
    return urlOrId;
  }

  // Extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = urlOrId.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

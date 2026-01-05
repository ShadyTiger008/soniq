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
  currentTime?: number;
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
  currentTime: seekTime,
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }

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
            setIsReady(true);
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
      setIsReady(false);
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
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return;

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
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isPlaying]);

  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.setVolume !== 'function') return;

    try {
      playerRef.current.setVolume(volume);
    } catch (e) {
      console.error("Error setting volume:", e);
    }
  }, [volume]);
  
  useEffect(() => {
    if (!playerRef.current || seekTime === undefined || typeof playerRef.current.getCurrentTime !== 'function') return;

    try {
      const currentPlayerTime = playerRef.current.getCurrentTime();
      // Only seek if the difference is significant (> 2 seconds) to avoid loops
      if (Math.abs(currentPlayerTime - seekTime) > 2) {
        playerRef.current.seekTo(seekTime, true);
      }
    } catch (e) {
      console.error("Error seeking video:", e);
    }
  }, [seekTime]);

  useEffect(() => {
    if (!playerRef.current || !isReady) return;

    // Update time more frequently for smoother playback (every 500ms)
    intervalRef.current = setInterval(() => {
      try {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
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
  }, [onTimeUpdate, isReady]);

  // Expose player methods
  useEffect(() => {
    if (playerRef.current) {
      (window as any).youtubePlayer = playerRef.current;
    }
  }, [playerRef.current]);

  if (!videoId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-900 p-6 text-center">
        <div className="mb-6 rounded-full bg-zinc-800 p-6 shadow-xl">
          <svg
            className="h-12 w-12 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">No song playing</h3>
        <p className="max-w-[260px] text-sm text-zinc-400">
          Search for a song or add music to the queue to get the party started.
        </p>
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

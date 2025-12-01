"use client";

import { useState } from "react";

interface MoodFilterProps {
  onMoodChange?: (mood: string) => void;
}

export function MoodFilter({ onMoodChange }: MoodFilterProps) {
  const [activeMood, setActiveMood] = useState("All");

  const moods = ["All", "Chill", "Lofi", "Party", "Study", "Focus", "Ambient"];

  const handleMoodChange = (mood: string) => {
    setActiveMood(mood);
    onMoodChange?.(mood);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {moods.map((mood) => (
        <button
          key={mood}
          onClick={() => handleMoodChange(mood)}
          className={`font-500 smooth-transition rounded-full px-4 py-2 whitespace-nowrap ${
            activeMood === mood
              ? "from-deep-purple to-electric-magenta text-soft-white neon-glow bg-gradient-to-r"
              : "glass-card hover:border-electric-magenta text-muted-foreground hover:text-soft-white"
          }`}
        >
          {mood}
        </button>
      ))}
    </div>
  );
}

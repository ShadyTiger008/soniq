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
          className={`font-500 smooth-transition rounded-full px-4 py-2 whitespace-nowrap border ${
            activeMood === mood
              ? "from-primary to-electric-magenta text-white shadow-lg shadow-primary/20 bg-gradient-to-r border-transparent"
              : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
          }`}
        >
          {mood}
        </button>
      ))}
    </div>
  );
}

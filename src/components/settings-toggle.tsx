"use client";

import { useState } from "react";

interface SettingsToggleProps {
  label: string;
  description?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function SettingsToggle({
  label,
  description,
  defaultChecked = false,
  onChange,
}: SettingsToggleProps) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleChange = () => {
    const newValue = !checked;
    setChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="glass-card hover:border-electric-magenta/50 smooth-transition flex items-center justify-between rounded-lg p-4">
      <div>
        <p className="font-500 text-soft-white">{label}</p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      <button
        onClick={handleChange}
        className={`smooth-transition relative h-7 w-12 rounded-full ${
          checked
            ? "from-deep-purple to-electric-magenta bg-gradient-to-r"
            : "bg-[rgba(108,43,217,0.2)]"
        }`}
      >
        <div
          className={`bg-soft-white smooth-transition absolute top-1 left-1 h-5 w-5 rounded-full ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

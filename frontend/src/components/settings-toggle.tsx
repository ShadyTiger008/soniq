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
    <div className="border border-border bg-muted/30 hover:border-primary/50 smooth-transition flex items-center justify-between rounded-lg p-4">
      <div>
        <p className="font-500 text-foreground">{label}</p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      <button
        onClick={handleChange}
        className={`smooth-transition relative h-7 w-12 rounded-full ${
          checked
            ? "bg-primary shadow-sm"
            : "bg-muted-foreground/30"
        }`}
      >
        <div
          className={`bg-white shadow-sm smooth-transition absolute top-1 left-1 h-5 w-5 rounded-full ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

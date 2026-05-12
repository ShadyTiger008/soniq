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
    <div className="group relative overflow-hidden bg-white/[0.02] border border-white/5 hover:border-primary/30 smooth-transition flex items-center justify-between rounded-[1.5rem] p-6 shadow-inner">
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-white uppercase tracking-widest pl-1">{label}</p>
        {description && (
          <p className="text-[10px] font-medium text-white/20 uppercase tracking-tight pl-1">{description}</p>
        )}
      </div>
      <button
        onClick={handleChange}
        className={`smooth-transition relative h-7 w-12 rounded-full overflow-hidden ${
          checked
            ? "bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
            : "bg-white/10"
        }`}
      >
        <div
          className={`bg-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] smooth-transition absolute top-1 left-1 h-5 w-5 rounded-full ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

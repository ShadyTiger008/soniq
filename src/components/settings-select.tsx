"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface SettingsSelectProps {
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function SettingsSelect({
  label,
  description,
  options,
  defaultValue = options[0]?.value,
  onChange,
}: SettingsSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);

  const handleSelect = (value: string) => {
    setSelected(value);
    onChange?.(value);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="font-500 text-soft-white mb-1">{label}</p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="glass-card hover:border-electric-magenta smooth-transition flex w-full items-center justify-between rounded-lg px-4 py-3 text-left"
        >
          <span className="text-soft-white">
            {options.find((o) => o.value === selected)?.label}
          </span>
          <ChevronDown
            className={`text-muted-foreground smooth-transition h-4 w-4 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="glass-card absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-lg">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`smooth-transition w-full px-4 py-3 text-left ${
                  selected === option.value
                    ? "from-deep-purple to-electric-magenta text-soft-white bg-gradient-to-r"
                    : "text-soft-white hover:bg-[rgba(108,43,217,0.2)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

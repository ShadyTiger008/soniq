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
        <p className="font-500 text-foreground mb-1">{label}</p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="border border-border bg-muted/30 hover:border-primary/50 smooth-transition flex w-full items-center justify-between rounded-lg px-4 py-3 text-left"
        >
          <span className="text-foreground">
            {options.find((o) => o.value === selected)?.label}
          </span>
          <ChevronDown
            className={`text-muted-foreground smooth-transition h-4 w-4 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="bg-card border border-border shadow-xl absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-lg">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`smooth-transition w-full px-4 py-3 text-left ${
                  selected === option.value
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground hover:bg-muted"
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

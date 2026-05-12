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
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-white uppercase tracking-widest pl-1">{label}</p>
        {description && (
          <p className="text-[10px] font-medium text-white/20 uppercase tracking-tight pl-1">{description}</p>
        )}
      </div>
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full flex items-center justify-between bg-white/[0.03] border border-white/5 hover:border-primary/50 smooth-transition rounded-2xl px-5 py-4 text-left group-focus-within:ring-1 group-focus-within:ring-primary/20"
        >
          <span className="text-sm font-black text-white italic tracking-tight">
            {options.find((o) => o.value === selected)?.label}
          </span>
          <ChevronDown
            className={`text-white/20 smooth-transition h-4 w-4 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 left-0 z-50 mt-3 overflow-hidden rounded-2xl bg-surface-highest/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="p-1.5">
                {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`smooth-transition w-full px-4 py-3 text-left rounded-xl text-[11px] font-black uppercase tracking-widest ${
                    selected === option.value
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                >
                    {option.label}
                </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

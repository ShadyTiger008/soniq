"use client";

import type React from "react";

import { useState } from "react";
import { X } from "lucide-react";
import { SettingsSelect } from "./settings-select";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (roomData: any) => void;
  isLoading?: boolean;
}

export function CreateRoomModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateRoomModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
    mood: "Chill",
    maxListeners: 1000,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onSubmit?.(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="glass-card relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading font-700 text-soft-white text-2xl">
            Create Room
          </h2>
          <button
            onClick={onClose}
            className="smooth-transition rounded-lg p-2 hover:bg-[rgba(108,43,217,0.2)]"
          >
            <X className="text-muted-foreground h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room name */}
          <div>
            <label className="font-600 text-soft-white mb-2 block text-sm">
              Room Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Midnight Vibes"
              maxLength={50}
              required
              className="text-soft-white placeholder-muted-foreground focus:border-electric-magenta smooth-transition w-full rounded-lg border border-[rgba(108,43,217,0.3)] bg-[rgba(26,22,51,0.6)] px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-600 text-soft-white mb-2 block text-sm">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell people what your room is about..."
              maxLength={200}
              rows={3}
              className="text-soft-white placeholder-muted-foreground focus:border-electric-magenta smooth-transition w-full resize-none rounded-lg border border-[rgba(108,43,217,0.3)] bg-[rgba(26,22,51,0.6)] px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Mood */}
          <SettingsSelect
            label="Mood"
            options={[
              { value: "Chill", label: "Chill" },
              { value: "Lofi", label: "Lofi" },
              { value: "Party", label: "Party" },
              { value: "Study", label: "Study" },
              { value: "Focus", label: "Focus" },
              { value: "Ambient", label: "Ambient" },
            ]}
            defaultValue={formData.mood}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, mood: value }))
            }
          />

          {/* Privacy */}
          <div>
            <label className="flex cursor-pointer items-center gap-3">
              <div
                className="smooth-transition relative h-7 w-12 rounded-full"
                style={{
                  backgroundColor: formData.isPrivate
                    ? "var(--primary)"
                    : "rgba(108,43,217,0.2)",
                }}
              >
                <div
                  className={`bg-soft-white smooth-transition absolute top-1 left-1 h-5 w-5 rounded-full ${
                    formData.isPrivate ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
              <div>
                <p className="font-600 text-soft-white">Private Room</p>
                <p className="text-muted-foreground text-sm">
                  {formData.isPrivate ? "Invite only" : "Anyone can join"}
                </p>
              </div>
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="glass-card hover:border-ocean-blue text-soft-white font-600 smooth-transition flex-1 rounded-lg px-4 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="from-deep-purple to-electric-magenta hover:from-electric-magenta hover:to-neon-pink text-soft-white font-600 smooth-transition neon-glow flex-1 rounded-lg bg-gradient-to-r px-4 py-2.5 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="border-soft-white h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Creating...
                </span>
              ) : (
                "Create Room"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

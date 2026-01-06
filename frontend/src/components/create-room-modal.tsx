"use client";

import type React from "react";

import { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { SettingsSelect } from "./settings-select";
import { UnsplashImagePicker } from "./ui/unsplash-picker";

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
    cover: "",
  });
  const [showPicker, setShowPicker] = useState(false);

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
      <div className="glass-card relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-6 border border-border">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading font-700 text-foreground text-2xl">
            Create Room
          </h2>
          <button
            onClick={onClose}
            className="smooth-transition rounded-lg p-2 hover:bg-muted"
          >
            <X className="text-muted-foreground h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room name */}
          <div>
            <label className="font-600 text-foreground mb-2 block text-sm">
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
              className="text-foreground placeholder-muted-foreground focus:border-primary smooth-transition w-full rounded-lg border border-border bg-muted/30 px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-600 text-foreground mb-2 block text-sm">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell people what your room is about..."
              maxLength={200}
              rows={3}
              className="text-foreground placeholder-muted-foreground focus:border-primary smooth-transition w-full resize-none rounded-lg border border-border bg-muted/30 px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Cover Image */}
          <div>
             <label className="font-600 text-foreground mb-2 block text-sm">
               Room Cover
             </label>
             {formData.cover ? (
                 <div className="relative aspect-video w-full rounded-lg overflow-hidden group border border-border">
                     <img src={formData.cover} alt="Room cover" className="w-full h-full object-cover" />
                     <button
                        type="button"
                        onClick={() => setShowPicker(!showPicker)}
                        className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 transition-colors"
                     >
                         Change Cover
                     </button>
                 </div>
             ) : (
                <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    className="w-full border border-dashed border-border bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary transition-all"
                >
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Select Cover Image</span>
                </button>
             )}
             
             {showPicker && (
                 <div className="mt-2 p-2 bg-muted/50 rounded-lg border border-border">
                     <UnsplashImagePicker 
                        onSelect={(url) => {
                            setFormData(prev => ({ ...prev, cover: url }));
                            setShowPicker(false);
                        }}
                     />
                 </div>
             )}
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
                className="smooth-transition relative h-7 w-12 rounded-full border border-border"
                style={{
                  backgroundColor: formData.isPrivate
                    ? "var(--primary)"
                    : "rgba(128, 128, 128, 0.2)",
                }}
              >
                <div
                  className={`bg-white shadow-sm smooth-transition absolute top-1 left-1 h-5 w-5 rounded-full ${
                    formData.isPrivate ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
              <div>
                <p className="font-600 text-foreground">Private Room</p>
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
              className="border border-border hover:bg-muted text-foreground font-semibold smooth-transition flex-1 rounded-xl px-4 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold smooth-transition flex-1 rounded-xl px-4 py-3 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
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

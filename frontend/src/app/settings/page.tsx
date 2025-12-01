"use client";

import { useState } from "react";
import { Settings, Volume2, Bell, Shield, Eye, LogOut } from "lucide-react";
import { SettingsToggle } from "@frontend/components/settings-toggle";
import { SettingsSelect } from "@frontend/components/settings-select";

export default function SettingsPage() {
  const [theme, setTheme] = useState("dark");
  const [audioQuality, setAudioQuality] = useState("high");

  return (
    <div className="from-midnight-black via-deep-navy to-midnight-black text-soft-white min-h-screen bg-gradient-to-b">
      {/* Header */}
      <div className="glass-card sticky top-0 z-20 border-b border-[rgba(108,43,217,0.2)] backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="font-heading flex items-center gap-3 text-3xl font-extrabold">
            <Settings className="text-electric-magenta h-8 w-8" />
            Settings
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {/* Theme Settings */}
        <section>
          <h2 className="font-heading font-700 text-soft-white mb-4 flex items-center gap-2 text-lg">
            <Eye className="text-ocean-blue h-5 w-5" />
            Display
          </h2>
          <div className="space-y-4">
            <SettingsSelect
              label="Theme"
              description="Choose your preferred color theme"
              options={[
                { value: "dark", label: "Dark (Default)" },
                { value: "light", label: "Light" },
                { value: "auto", label: "System" },
              ]}
              defaultValue={theme}
              onChange={setTheme}
            />
          </div>
        </section>

        {/* Audio Settings */}
        <section>
          <h2 className="font-heading font-700 text-soft-white mb-4 flex items-center gap-2 text-lg">
            <Volume2 className="text-electric-magenta h-5 w-5" />
            Audio
          </h2>
          <div className="space-y-4">
            <SettingsSelect
              label="Audio Quality"
              description="Higher quality uses more bandwidth"
              options={[
                { value: "low", label: "Low (128kbps)" },
                { value: "normal", label: "Normal (256kbps)" },
                { value: "high", label: "High (320kbps)" },
                { value: "lossless", label: "Lossless (FLAC)" },
              ]}
              defaultValue={audioQuality}
              onChange={setAudioQuality}
            />
            <SettingsToggle
              label="Normalize Audio"
              description="Automatically adjust volume levels"
              defaultChecked={true}
            />
            <SettingsToggle
              label="Bass Boost"
              description="Enhance bass frequencies"
              defaultChecked={false}
            />
          </div>
        </section>

        {/* Notification Settings */}
        <section>
          <h2 className="font-heading font-700 text-soft-white mb-4 flex items-center gap-2 text-lg">
            <Bell className="text-neon-cyan h-5 w-5" />
            Notifications
          </h2>
          <div className="space-y-4">
            <SettingsToggle
              label="Room Invitations"
              description="Notify when friends invite you to rooms"
              defaultChecked={true}
            />
            <SettingsToggle
              label="Chat Messages"
              description="Notify when new messages arrive"
              defaultChecked={true}
            />
            <SettingsToggle
              label="DJ Requests"
              description="Notify when your track request plays"
              defaultChecked={true}
            />
            <SettingsToggle
              label="New Followers"
              description="Notify when users follow your profile"
              defaultChecked={false}
            />
            <SettingsToggle
              label="Email Notifications"
              description="Receive important updates via email"
              defaultChecked={false}
            />
          </div>
        </section>

        {/* Privacy & Security */}
        <section>
          <h2 className="font-heading font-700 text-soft-white mb-4 flex items-center gap-2 text-lg">
            <Shield className="text-neon-pink h-5 w-5" />
            Privacy & Security
          </h2>
          <div className="space-y-4">
            <SettingsToggle
              label="Make Profile Public"
              description="Allow others to see your profile"
              defaultChecked={true}
            />
            <SettingsToggle
              label="Show Listening Status"
              description="Let others know what you're listening to"
              defaultChecked={true}
            />
            <SettingsToggle
              label="Allow DM Requests"
              description="Accept direct messages from anyone"
              defaultChecked={false}
            />
            <div className="glass-card rounded-lg p-4">
              <button className="text-ocean-blue hover:text-neon-cyan smooth-transition font-500">
                Change Password
              </button>
            </div>
            <div className="glass-card rounded-lg p-4">
              <button className="text-ocean-blue hover:text-neon-cyan smooth-transition font-500">
                Two-Factor Authentication
              </button>
            </div>
          </div>
        </section>

        {/* Account */}
        <section>
          <h2 className="font-heading font-700 text-soft-white mb-4 text-lg">
            Account
          </h2>
          <div className="space-y-4">
            <button className="glass-card hover:border-destructive smooth-transition text-destructive font-500 flex w-full items-center gap-2 rounded-lg px-4 py-3">
              <LogOut className="h-5 w-5" />
              Logout
            </button>
            <button className="glass-card hover:border-destructive smooth-transition text-destructive font-500 w-full rounded-lg px-4 py-3">
              Delete Account
            </button>
          </div>
        </section>

        <div className="text-muted-foreground py-8 text-center text-sm">
          <p>SONIQ v1.0.0 • Last updated: December 1, 2024</p>
        </div>
      </div>
    </div>
  );
}

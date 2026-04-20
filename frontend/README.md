# SONIQ Frontend 🎨

The premium frontend experience for **SONIQ** - Listen together, vibe together. Built with **Next.js 15**, **React 19**, and **Radix UI**.

## ✨ Visual Excellence

SONIQ is designed with a "Premium-First" philosophy:
- **Glassmorphism**: Sleek, transparent UI elements with background blur.
- **Dynamic Accent Colors**: Mood-based themes (Chill, Party, Lofi, etc.).
- **Micro-animations**: Powered by `framer-motion` for a fluid user experience.
- **Responsive Layout**: Optimized for Desktop and Mobile/Tablet views.

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI (Radix UI)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Drag & Drop**: dnd-kit (for queue reordering)

## 🏗️ Architecture & State Management

### Zustand Stores
The application state is decentralized into focused stores:
- `useAuthStore`: Handles user authentication and profile state.
- `useRoomStore`: Manages active room data, participants, and roles.
- `usePlayerStore`: Controls the synchronized playback state, queue, and volume.
- `useChatStore`: Manages real-time messages and notification status.

### YouTube Synchronization
The core of SONIQ is the synchronized YouTube player:
- **Custom Player Wrapper**: An abstraction over the YouTube IFrame API.
- **Event Handling**: Listens for Socket.IO events (`player:state-changed`, `player:seeked`) and adjusts the internal player state accordingly.
- **Drift Correction**: Periodically syncs the player's `currentTime` with the server's reference timestamp to prevent audio drift.

## 📁 Folder Structure

```bash
frontend/
├── public/             # Static assets & logos
├── src/
│   ├── app/            # Next.js App Router (Pages & Layouts)
│   ├── components/
│   │   ├── dashboard/  # Sidebar, Room Cards, Activity Feed
│   │   ├── player/     # YouTube Player, Controls, Queue
│   │   ├── chat/       # Live Chat, Emoji Picker
│   │   └── ui/         # Shadcn base components
│   ├── hooks/          # Custom React hooks (useSocket, useMedia)
│   ├── lib/            # Utility functions & API clients
│   └── store/          # Zustand store definitions
```

## 🚀 Installation & Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_key
   ```

3. **Development Mode**:
   ```bash
   pnpm dev
   ```

4. **Build for Production**:
   ```bash
   pnpm build
   pnpm start
   ```

## 🎨 Design System

SONIQ uses a custom design system based on Tailwind CSS:
- **Colors**: Deep obsidians and vibrant greens (`#1ED760`).
- **Typography**: Inter for standard text, Orbitron or similar for headings.
- **Shapes**: High-radius corners (12px - 24px) for a modern look.

## 📜 License

MIT License

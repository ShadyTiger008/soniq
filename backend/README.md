# SONIQ Backend 🚀

Production-grade backend server for **SONIQ** - Premium Social Music Streaming Platform. This server handles authentication, room state management, and real-time synchronization using Socket.IO.

## 🏗️ Architecture

The backend follows a modular architecture:
- **Express.js** for RESTful API endpoints.
- **Socket.io** for bidirectional real-time communication.
- **MongoDB** for persistent storage of users, rooms, and chat history.
- **Winston** for robust production-grade logging.

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate Limiting (Express Rate Limit)
- **Validation**: Zod (if applicable) / Mongoose Schema

## 📋 Role & Permission System

SONIQ features a sophisticated permission system built into the Socket handlers:

| Role | Permissions |
| :--- | :--- |
| **Host** (Owner) | Full control over room settings, participants, and playback. |
| **DJ** | Can manage the queue, play/pause, and skip tracks. |
| **Listener** | Can chat, browse, and request songs (if allowed by host). |

### Dynamic Permissions
Hosts can dynamically configure room permissions:
- `playPause`: Everyone, DJ, or Host only.
- `skip`: Everyone, DJ, or Host only.
- `volume`: Everyone, DJ, or Host only (Global room volume).
- `addToQueue`: Everyone, DJ, or Host only.

## 🔄 Real-time Synchronization

SONIQ uses a high-precision sync algorithm:
1. **Server Timestamping**: All player events include a server-side timestamp.
2. **State Broadcasting**: When a state changes (e.g., skip), the server broadcasts the exact `currentTime` and `timestamp`.
3. **Client Adjustment**: Clients calculate the network latency and adjust the playback time to match the room state down to the millisecond.

## 🔌 Socket.IO API

### Room Events (`room:`)
- `room:join`: Joins a room and retrieves initial state.
- `room:leave`: Gracefully leave a room.
- `room:member-joined`: Notifies everyone of a new member.
- `room:member-left`: Notifies everyone when someone leaves.

### Player Events (`player:`)
- `player:play-pause`: Control playback state.
- `player:skip`: Skip to next/previous track.
- `player:seek`: Seek to a specific timestamp.
- `player:add-to-queue`: Add a YouTube video to the room queue.
- `player:reorder-queue`: Drag-and-drop support for queue management.

### Chat Events (`chat:`)
- `chat:message`: Send a real-time message.
- `chat:typing`: Indicate typing status to others.

## 🚀 Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file based on the template below:
   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ALLOWED_ORIGINS=http://localhost:3000
   ```

3. **Development Mode**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type check
npm run typecheck
```

## 📜 License

MIT License

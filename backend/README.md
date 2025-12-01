# SONIQ Backend

Production-grade backend server for SONIQ - Premium Social Music Streaming Platform.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Cache**: Redis (optional, for scaling)
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── cors.ts      # CORS configuration
│   │   ├── database.ts  # MongoDB connection
│   │   └── redis.ts     # Redis connection
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── room.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # Authentication
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── requestLogger.ts
│   ├── models/          # Mongoose models
│   │   ├── room.model.ts
│   │   └── user.model.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── room.routes.ts
│   │   ├── user.routes.ts
│   │   └── index.ts
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   ├── room.service.ts
│   │   └── user.service.ts
│   ├── socket/          # Socket.IO handlers
│   │   ├── handlers/
│   │   │   ├── chat.handler.ts
│   │   │   ├── player.handler.ts
│   │   │   └── room.handler.ts
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── logger.ts
│   ├── app.ts           # Express app setup
│   └── index.ts         # Server entry point
├── logs/                # Log files (gitignored)
├── dist/                # Compiled JavaScript (gitignored)
├── package.json
├── tsconfig.json
└── .env                 # Environment variables (gitignored)
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh authentication token

### Rooms (`/api/rooms`)
- `GET /api/rooms` - Get all rooms (public)
- `GET /api/rooms/:id` - Get room by ID (public)
- `POST /api/rooms` - Create new room (protected)
- `PUT /api/rooms/:id` - Update room (protected, host only)
- `DELETE /api/rooms/:id` - Delete room (protected, host only)
- `POST /api/rooms/:id/join` - Join room (protected)
- `POST /api/rooms/:id/leave` - Leave room (protected)

### Users (`/api/users`)
- `GET /api/users/me` - Get current user profile (protected)
- `PUT /api/users/me` - Update current user profile (protected)

## Socket.IO Events

### Room Events
- `room:join` - Join a room
- `room:leave` - Leave a room
- `room:get-members` - Get room members
- `room:member-joined` - Member joined (broadcast)
- `room:member-left` - Member left (broadcast)

### Chat Events
- `chat:message` - Send chat message
- `chat:new-message` - New message received (broadcast)
- `chat:reaction` - Add reaction to message
- `chat:reaction-added` - Reaction added (broadcast)
- `chat:typing` - Typing indicator

### Player Events
- `player:play-pause` - Play/pause control (DJ only)
- `player:state-changed` - Player state changed (broadcast)
- `player:skip` - Skip song (DJ only)
- `player:song-changed` - Song changed (broadcast)
- `player:seek` - Seek to position (DJ only)
- `player:volume` - Change volume (DJ only)
- `player:add-to-queue` - Add song to queue
- `player:get-state` - Get current player state

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/soniq

# Redis (optional)
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info
```

## Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure environment variables
3. Build the project: `npm run build`
4. Start the server: `npm start`
5. Use a process manager like PM2 for production

## Notes

- Authentication is currently using dummy tokens. Implement JWT in production.
- Redis adapter is optional but recommended for scaling Socket.IO across multiple servers.
- Logs are written to `logs/` directory (ensure it exists or create it).


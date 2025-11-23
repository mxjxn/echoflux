# EchoFlux Setup Guide

## Prerequisites

- Node.js 18+
- npm 10+

## Installation

### 1. Clone and Install

```bash
git clone <repository-url>
cd echoflux
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="file:./dev.db"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Custom port for development
PORT=3000
```

For production, update `DATABASE_URL` to point to PostgreSQL.

### 3. Database Setup (Optional for Prototype)

The prototype uses an in-memory database. To use a real database with Prisma:

```bash
cd packages/database
npx prisma generate
npx prisma db push
npx prisma db seed
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

**Important**: The development server uses a custom Node.js server (`apps/web/server.js`) that integrates:
- Next.js app with App Router
- Socket.IO server for real-time collaboration
- CORS configuration for WebSocket connections
- Session management with automatic cleanup

### Available Commands

- `npm run dev` - Start development servers
- `npm run build` - Build all packages
- `npm run lint` - Lint code
- `npm run clean` - Clean build artifacts

## Important Notes

### SuperSonic Audio Engine

SuperSonic requires specific browser headers for SharedArrayBuffer support:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

These are configured in `next.config.js` and will work automatically in development and production.

### Browser Compatibility

SuperSonic requires:
- Modern browsers (Chrome 88+, Firefox 89+, Safari 15.2+)
- SharedArrayBuffer support
- AudioWorklet support

### Self-Hosting Requirement

All SuperSonic WASM and worker files must be served from the same origin. They are automatically copied to `/public/supersonic/` during setup.

## Project Structure

```
echoflux/
├── apps/
│   └── web/                    # Next.js PWA application
│       ├── app/                # App router pages
│       │   ├── page.tsx       # Landing page
│       │   ├── sequencer/     # 16-step sequencer
│       │   ├── tracker/       # Music tracker
│       │   ├── jam/           # Jam session lobby
│       │   ├── session/[id]/  # Live jam sessions
│       │   ├── feed/          # Social feed
│       │   └── api/           # REST API endpoints
│       ├── components/         # React components
│       │   └── tracker/       # Tracker-specific components
│       ├── hooks/              # Custom React hooks
│       │   ├── useSuperSonic.ts
│       │   ├── useAudioEngine.ts
│       │   ├── useTrackerEngine.ts
│       │   └── useCollaboration.ts
│       ├── lib/                # Utilities and stores
│       ├── server.js           # Custom Socket.IO + Next.js server
│       └── public/             # Static assets
│           └── supersonic/    # SuperSonic WASM/workers
├── packages/
│   ├── tracker/                # Tracker core library
│   ├── database/               # Prisma schema and client
│   └── music-engine/           # Audio engine wrapper
├── docs/
│   └── COLLABORATION_ARCHITECTURE.md
└── package.json                # Root package.json
```

## Features

### Sequencer (`/sequencer`)
- 16-step sequencer (4 bars)
- Multiple synthesizer options (120+ Sonic Pi synthdefs)
- BPM control (60-180)
- Pitch and velocity control
- Real-time synth parameter modulation

### Music Tracker (`/tracker`)
- Professional tracker-style interface (64 rows)
- **Vim-like navigation**: h/j/k/l or arrow keys
- **Modal editing**: Normal mode (Esc) and Insert mode (i)
- **Piano keyboard input**: QWERTY mapped to piano keys
  - Lower octave: z, x, c, v, b, n, m
  - Upper octave: q, w, e, r, t, y, u
- Pattern editor with Note, Instrument, Volume, and Effect columns
- Page-based scrolling (PageUp/PageDown, Home/End)

### Collaborative Jamming (`/jam` and `/session/[id]`)
- **Create or join sessions** with unique session IDs
- **Real-time synchronization** (up to 8 users)
- **Pattern-based sync**: Only pattern changes are transmitted (not audio)
- **User presence**: See all connected users with color-coded indicators
- **Shared playback**: Coordinated play/pause across all clients
- **Low latency**: <50ms pattern sync, <10ms playback accuracy
- **Auto-cleanup**: Sessions timeout after 30 minutes of inactivity

### Feed (`/feed`)
- Browse community sequences
- Play sequences directly
- Remix functionality with provenance tracking
- Play/remix count tracking

### PWA Support
- Offline capability (when built)
- Installable as app
- Service worker for caching

## Troubleshooting

### Audio Not Playing

1. Check browser console for errors
2. Ensure you're on a supported browser
3. Check that SuperSonic files are accessible at `/supersonic/`
4. Verify headers are set correctly in Network tab

### Build Errors

If you encounter build errors:

```bash
# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Issues

The prototype uses mock data. For full database support:

1. Ensure Prisma can download binaries
2. Set `DATABASE_URL` in `.env`
3. Run `npx prisma generate && npx prisma db push`

### Collaboration Issues

If collaborative sessions aren't working:

1. Check that the custom server is running (`server.js`)
2. Verify WebSocket connection in browser console
3. Ensure no firewall is blocking WebSocket connections
4. Check that `NEXT_PUBLIC_APP_URL` matches your actual URL
5. Look for Socket.IO errors in server logs

## Next Steps

### Immediate Improvements
1. **Authentication**: Add user authentication (Auth.js, Clerk, etc.)
2. **Real Database**: Connect Prisma to PostgreSQL/MySQL
3. **Tracker Enhancements**: Implement effects column and pattern chaining
4. **CRDT Integration**: Replace last-write-wins with Yjs or Automerge for better conflict resolution

### Future Features
1. **Export**: Add WAV/MP3 export functionality
2. **MIDI**: Add MIDI input/output support
3. **Effects Chain**: Add reverb, delay, and filter effects
4. **Sample Support**: Upload and play custom samples
5. **Offline Collaboration**: Enable offline editing with sync on reconnect
6. **Social Features**: Add likes, comments, user profiles

### Architecture
1. **Production Deployment**: Deploy with WebSocket support (requires sticky sessions or Redis adapter)
2. **Performance**: Optimize pattern sync for >16 users
3. **Monitoring**: Add analytics and error tracking

## License

MIT

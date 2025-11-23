# EchoFlux 🎵

A collaborative music PWA for creating, sharing, and remixing sequences using SuperSonic (WebAssembly SuperCollider).

![Status](https://img.shields.io/badge/status-prototype-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### Music Creation
- 🎹 **16-Step Sequencer** - Create 4-bar loops with visual step programming
- 🎼 **Music Tracker** - Professional tracker-style editor with vim-like navigation (h/j/k/l)
- 🎵 **120+ Sonic Pi Synthdefs** - Choose from beep, saw, tb303, prophet, and more
- 🎛️ **Real-time Controls** - Adjust BPM, pitch, velocity, and synth parameters live
- ⚡ **Keyboard-First Workflow** - Modal editing (Normal/Insert modes) for fast composition

### Collaboration
- 🌐 **Real-time Jam Sessions** - Collaborate with up to 8 users simultaneously
- 🔄 **Pattern-Based Sync** - Efficient low-latency synchronization (<50ms)
- 👥 **User Presence** - See who's jamming with color-coded indicators
- 🎮 **Shared Playback** - Coordinated play/pause across all clients

### Social Features
- 📡 **Social Feed** - Share your sequences with the community
- 🔄 **Remix System** - Load and modify others' sequences with full provenance tracking
- 📊 **Engagement Metrics** - Track plays and remixes

### Platform
- 📱 **Progressive Web App** - Install on mobile/desktop, works offline
- 🎨 **Modern UI** - Dark theme, responsive design, smooth animations
- 🚀 **WebAssembly Audio** - SuperSonic (SuperCollider) running in-browser

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (includes Socket.IO for collaboration)
npm run dev
```

Visit `http://localhost:3000` to start creating!

**Note**: The dev server uses a custom Node.js server (`server.js`) that integrates Socket.IO for real-time collaboration features.

## 📚 Documentation

See [SETUP.md](./SETUP.md) for detailed installation and configuration instructions.

## 🏗️ Architecture

This is a **Turborepo monorepo** with the following structure:

```
echoflux/
├── apps/web/                    # Next.js 14 PWA
│   ├── app/                     # App router
│   │   ├── page.tsx            # Landing page
│   │   ├── sequencer/          # 16-step sequencer
│   │   ├── tracker/            # Music tracker with vim navigation
│   │   ├── jam/                # Collaborative session lobby
│   │   ├── session/[id]/       # Live jam sessions
│   │   ├── feed/               # Social feed
│   │   └── api/                # REST API endpoints
│   ├── components/             # React components
│   │   └── tracker/            # Tracker-specific UI
│   ├── hooks/                  # Custom React hooks
│   │   ├── useSuperSonic.ts    # Audio engine init
│   │   ├── useAudioEngine.ts   # Sequencer playback
│   │   ├── useTrackerEngine.ts # Tracker playback
│   │   └── useCollaboration.ts # Socket.IO client
│   ├── lib/                    # Utilities, stores, types
│   ├── server.js               # Custom Socket.IO server
│   └── public/supersonic/      # WASM/workers (self-hosted)
├── packages/
│   ├── tracker/                # Tracker core library
│   ├── database/               # Prisma schema
│   └── music-engine/           # Audio engine types
├── docs/
│   └── COLLABORATION_ARCHITECTURE.md  # Pattern-based sync design
└── turbo.json                  # Turborepo configuration
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14, React 18, TailwindCSS |
| **Audio** | SuperSonic (SuperCollider WASM), AudioWorklet |
| **Real-time** | Socket.IO (WebSockets) |
| **State** | Zustand |
| **Database** | Prisma, SQLite (dev) / PostgreSQL (prod) |
| **Build** | Turborepo, TypeScript |
| **PWA** | next-pwa, Service Workers |

## 🎮 Usage

### Creating a Sequence (Sequencer)

1. Navigate to `/sequencer`
2. Select a synth (beep, saw, tb303, etc.)
3. Click steps to add/remove notes
4. Adjust BPM, pitch, and velocity
5. Press Play to hear your sequence
6. Click "Save to Feed" to share

### Using the Music Tracker

1. Navigate to `/tracker`
2. **Navigation** (Normal mode):
   - `h/j/k/l` or Arrow keys to move cursor
   - `PageUp/PageDown` to scroll by page
   - `Home/End` to jump to top/bottom
3. **Editing**:
   - Press `i` to enter Insert mode
   - Use QWERTY keyboard as piano (z-m for lower octave, q-u for upper)
   - Press `Esc` to return to Normal mode
4. **Playback**: Use transport controls to play/pause

### Collaborative Jamming

1. Navigate to `/jam`
2. **Create a Session**: Click "Create New Session"
3. **Join a Session**: Enter session ID and click "Join"
4. **Collaborate**: All users see real-time changes to:
   - Note toggles
   - Synth selection
   - BPM and parameters
   - Playback state
5. **User Presence**: See connected users with color badges

### Remixing

1. Browse the `/feed`
2. Click "Play" to preview a sequence
3. Click "Remix" to load it into the sequencer
4. Modify and save as your own

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start dev servers (with hot reload)
npm run build    # Build all packages for production
npm run lint     # Lint codebase
npm run clean    # Remove build artifacts
```

### Key Files

**Audio & Playback:**
- `apps/web/hooks/useSuperSonic.ts` - SuperSonic initialization
- `apps/web/hooks/useAudioEngine.ts` - Sequencer playback engine
- `apps/web/hooks/useTrackerEngine.ts` - Tracker playback engine

**State Management:**
- `apps/web/lib/store.ts` - Zustand state management
- `packages/tracker/src/store.ts` - Tracker state

**Collaboration:**
- `apps/web/server.js` - Custom Socket.IO server
- `apps/web/hooks/useCollaboration.ts` - Real-time sync client
- `docs/COLLABORATION_ARCHITECTURE.md` - Pattern-based sync design

**Database:**
- `packages/database/prisma/schema.prisma` - Database schema

### Collaboration Architecture

EchoFlux uses **pattern-based synchronization** for efficient real-time collaboration:

- **Low latency**: <50ms pattern sync, <10ms playback accuracy
- **Bandwidth efficient**: Only pattern deltas are sent (not audio or OSC messages)
- **Client-side scheduling**: Each browser runs SuperSonic independently
- **Timestamp coordination**: Shared clock for synchronized playback
- **Session management**: Auto-cleanup after 30 minutes of inactivity
- **Supports 8-16 simultaneous users** per session

See [docs/COLLABORATION_ARCHITECTURE.md](./docs/COLLABORATION_ARCHITECTURE.md) for detailed design.

## 🌐 Browser Requirements

SuperSonic requires modern browsers with:
- SharedArrayBuffer support
- AudioWorklet API
- Minimum: Chrome 88+, Firefox 89+, Safari 15.2+

## 🎯 Roadmap

### Completed ✅
- [x] Step sequencer with 16 steps
- [x] Multiple synth selection
- [x] Feed and remix system
- [x] SuperSonic integration
- [x] PWA support
- [x] Music tracker with vim navigation
- [x] Real-time collaborative jam sessions
- [x] Pattern-based synchronization
- [x] User presence and session management

### In Progress 🚧
- [ ] User authentication
- [ ] PostgreSQL integration
- [ ] Enhanced tracker features (effects column, pattern chaining)

### Planned 📋
- [ ] Sequence export (WAV/MP3)
- [ ] MIDI input/output
- [ ] Effects chain (reverb, delay, filter)
- [ ] Sample upload and playback
- [ ] CRDT-based conflict resolution
- [ ] Offline collaboration support

## 🤝 Contributing

This is a prototype. Contributions welcome! Please open an issue first to discuss major changes.

## 📄 License

MIT - See LICENSE file for details

## 🙏 Credits

- **SuperSonic** by [Sam Aaron](https://github.com/samaaron)
- **SuperCollider** synthesis engine
- **Sonic Pi** synthdefs and inspiration

---

**Built with ❤️ using SuperSonic and Next.js**

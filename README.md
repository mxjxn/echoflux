# EchoFlux Tracker 🎼

A professional music tracker with vim-like navigation powered by SuperSonic (WebAssembly SuperCollider).

![Status](https://img.shields.io/badge/status-prototype-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### Music Creation
- 🎼 **Music Tracker** - Professional tracker-style editor with vim-like navigation (h/j/k/l)
- 🎵 **120+ Sonic Pi Synthdefs** - Choose from beep, saw, tb303, prophet, and more
- 🎛️ **Real-time Controls** - Adjust BPM, pitch, velocity, and synth parameters live
- ⚡ **Keyboard-First Workflow** - Modal editing (Normal/Insert modes) for fast composition
- 📝 **Pattern-Based Composition** - Create complex songs with multiple patterns

### Platform
- 📱 **Progressive Web App** - Install on mobile/desktop, works offline
- 🎨 **Modern UI** - Dark theme, responsive design, smooth animations
- 🚀 **WebAssembly Audio** - SuperSonic (SuperCollider) running in-browser

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to start creating!

## 📚 Documentation

See [TRACKER_ROADMAP.md](./TRACKER_ROADMAP.md) for the complete feature roadmap and development plans.

See [SETUP.md](./SETUP.md) for detailed installation and configuration instructions.

## 🏗️ Architecture

This is a **Turborepo monorepo** with the following structure:

```
echoflux/
├── apps/web/                    # Next.js 14 PWA
│   ├── app/                     # App router
│   │   ├── page.tsx            # Tracker (main app)
│   │   ├── tracker/            # Music tracker with vim navigation
│   │   └── tracker/            # Music tracker
│   ├── components/             # React components
│   │   └── tracker/            # Tracker-specific UI
│   ├── hooks/                  # Custom React hooks
│   │   ├── useSuperSonic.ts    # Audio engine init
│   │   └── useTrackerEngine.ts # Tracker playback
│   ├── lib/                    # Utilities, stores, types
│   └── public/supersonic/      # WASM/workers (self-hosted)
├── packages/
│   ├── tracker/                # Tracker core library
│   ├── database/               # Prisma schema
│   └── music-engine/           # Audio engine types
└── turbo.json                  # Turborepo configuration
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14, React 18, TailwindCSS |
| **Audio** | SuperSonic (SuperCollider WASM), AudioWorklet |
| **State** | Zustand |
| **Build** | Turborepo, TypeScript |
| **PWA** | next-pwa, Service Workers |

## 🎮 Usage

### Using the Music Tracker

1. **Navigation** (Normal mode):
   - `h/j/k/l` or Arrow keys to move cursor
   - `PageUp/PageDown` to scroll by page
   - `Home/End` to jump to top/bottom
2. **Editing**:
   - Press `i` to enter Insert mode
   - Use QWERTY keyboard as piano (z-m for lower octave, q-u for upper)
   - Press `Esc` to return to Normal mode
3. **Playback**: Use transport controls to play/pause

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start dev server (with hot reload)
npm run build    # Build all packages for production
npm run lint     # Lint codebase
npm run clean    # Remove build artifacts
```

### Key Files

**Audio & Playback:**
- `apps/web/hooks/useSuperSonic.ts` - SuperSonic initialization
- `apps/web/hooks/useTrackerEngine.ts` - Tracker playback engine

**State Management:**
- `apps/web/lib/store.ts` - Zustand state management
- `packages/tracker/src/store.ts` - Tracker state

**Database:**
- `packages/database/prisma/schema.prisma` - Database schema

## 🌐 Browser Requirements

SuperSonic requires modern browsers with:
- SharedArrayBuffer support
- AudioWorklet API
- Minimum: Chrome 88+, Firefox 89+, Safari 15.2+

## 🎯 Roadmap

See [TRACKER_ROADMAP.md](./TRACKER_ROADMAP.md) for the complete feature roadmap.

### Completed ✅
- [x] Music tracker with vim navigation
- [x] SuperSonic integration
- [x] PWA support
- [x] Pattern-based composition
- [x] Real-time synthesis

### In Progress 🚧
- [ ] File management (save/load)
- [ ] Undo/redo system
- [ ] Pattern sequencing UI
- [ ] Enhanced tracker features (effects column, pattern chaining)

### Planned 📋
- [ ] Audio export (WAV/MP3)
- [ ] MIDI input/output
- [ ] Effects system
- [ ] Advanced editing features
- [ ] Collaboration features

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

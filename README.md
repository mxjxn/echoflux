# EchoFlux 🎵

A collaborative music PWA for creating, sharing, and remixing sequences using SuperSonic (WebAssembly SuperCollider).

![Status](https://img.shields.io/badge/status-prototype-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🎹 **16-Step Sequencer** - Create 4-bar loops with visual step programming
- 🎵 **120+ Sonic Pi Synthdefs** - Choose from beep, saw, tb303, prophet, and more
- 🎛️ **Real-time Controls** - Adjust BPM, pitch, velocity, and synth parameters live
- 📡 **Social Feed** - Share your sequences with the community
- 🔄 **Remix System** - Load and modify others' sequences with full provenance tracking
- 📱 **Progressive Web App** - Install on mobile/desktop, works offline
- 🎨 **Modern UI** - Dark theme, responsive design, smooth animations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to start creating!

## 📚 Documentation

See [SETUP.md](./SETUP.md) for detailed installation and configuration instructions.

## 🏗️ Architecture

This is a **Turborepo monorepo** with the following structure:

```
echoflux/
├── apps/web/              # Next.js 14 PWA
│   ├── app/              # App router (/, /sequencer, /feed)
│   ├── components/       # React components
│   ├── hooks/            # SuperSonic integration hooks
│   └── public/supersonic/ # WASM/workers (self-hosted)
├── packages/
│   ├── database/         # Prisma schema
│   └── music-engine/     # Audio engine types
└── turbo.json            # Turborepo configuration
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14, React 18, TailwindCSS |
| **Audio** | SuperSonic (SuperCollider WASM), AudioWorklet |
| **State** | Zustand |
| **Database** | Prisma, SQLite (dev) / PostgreSQL (prod) |
| **Build** | Turborepo, TypeScript |
| **PWA** | next-pwa, Service Workers |

## 🎮 Usage

### Creating a Sequence

1. Navigate to `/sequencer`
2. Select a synth (beep, saw, tb303, etc.)
3. Click steps to add/remove notes
4. Adjust BPM, pitch, and velocity
5. Press Play to hear your sequence
6. Click "Save to Feed" to share

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

- `apps/web/hooks/useSuperSonic.ts` - SuperSonic initialization
- `apps/web/hooks/useAudioEngine.ts` - Playback engine
- `apps/web/lib/store.ts` - Zustand state management
- `packages/database/prisma/schema.prisma` - Database schema

## 🌐 Browser Requirements

SuperSonic requires modern browsers with:
- SharedArrayBuffer support
- AudioWorklet API
- Minimum: Chrome 88+, Firefox 89+, Safari 15.2+

## 🎯 Roadmap

- [x] Step sequencer with 16 steps
- [x] Multiple synth selection
- [x] Feed and remix system
- [x] SuperSonic integration
- [x] PWA support
- [ ] User authentication
- [ ] PostgreSQL integration
- [ ] Sequence export (WAV/MP3)
- [ ] MIDI input/output
- [ ] Collaborative live sessions
- [ ] Effects chain
- [ ] Sample upload

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

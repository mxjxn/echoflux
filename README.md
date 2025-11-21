# EchoFlux 🎵

A collaborative music PWA for creating, sharing, and remixing sequences using SuperSonic (WebAssembly SuperCollider).

## Architecture

This is a Turborepo monorepo containing:

- `apps/web` - Next.js PWA with the sequencer interface and feed
- `packages/music-engine` - SuperSonic wrapper for audio synthesis
- `packages/ui` - Shared React components
- `packages/database` - Database schema and client (Prisma)

## Features

- 🎹 4-bar step sequencer with SuperCollider synthdefs
- 🎨 Synth parameter modulation
- 📡 Share sequences to a social feed
- 🔄 Remix and modify others' sequences
- 📱 Progressive Web App (offline capable)

## Getting Started

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Audio**: SuperSonic (WebAssembly SuperCollider)
- **Database**: Prisma + SQLite (development) / PostgreSQL (production)
- **Build**: Turborepo
- **PWA**: next-pwa

## Development

The app runs on `http://localhost:3000` with hot reloading enabled.

## License

MIT

# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview
- Monorepo managed by Turborepo (turbo.json) with npm workspaces
- Node >= 18, npm 10 (see package.json engines and packageManager)
- Apps and packages:
  - apps/web: Next.js 14 PWA with a custom Node server (Socket.IO) and App Router
  - packages/database: Prisma schema and client (SQLite for dev; intended PostgreSQL for prod)
  - packages/music-engine: TypeScript audio engine wrapper (prototype using Web Audio API)

Common commands
- Install dependencies
  ```bash
  npm install
  ```

- Run all dev tasks (starts web via custom server and package watchers)
  ```bash
  npm run dev
  ```

- Build everything
  ```bash
  npm run build
  ```

- Lint and format
  ```bash
  npm run lint
  npm run format
  ```

- Clean build artifacts
  ```bash
  npm run clean
  ```

Workspace-specific commands
- Web app (Next.js)
  ```bash
  # Start with custom server (enables Socket.IO)
  npm run -w web dev

  # Start the stock Next dev server (no Socket.IO)
  npm run -w web dev:next

  # Build and run in production mode
  npm run -w web build
  npm run -w web start
  ```

- Music engine package
  ```bash
  # Type-check/build once
  npm run -w @echoflux/music-engine build

  # Watch mode
  npm run -w @echoflux/music-engine dev

  # Clean its dist/
  npm run -w @echoflux/music-engine clean
  ```

- Database package (optional in prototype)
  The web API uses mock data for now. To use Prisma locally with SQLite:
  ```bash
  # Create packages/database/.env with:
  # DATABASE_URL="file:./prisma/dev.db"

  # Generate client, create schema, open studio, seed
  (cd packages/database && npx prisma generate)
  (cd packages/database && npx prisma db push)
  (cd packages/database && npx prisma studio)   # optional
  (cd packages/database && npx prisma db seed)  # optional
  ```
  Alternatively, set DATABASE_URL in apps/web/.env.local to
  file:../../packages/database/prisma/dev.db when wiring the app to Prisma.

- Tests
  No test runner is configured in this repo yet.

High-level architecture
- Turborepo pipeline (turbo.json)
  - Tasks: dev (non-cached, persistent), build (depends on ^build; outputs .next/** and dist/**), lint (depends on ^lint), clean (non-cached)
  - Root scripts dispatch into each workspace via turbo

- Web application (apps/web)
  - App Router structure under app/ (pages like /, /sequencer, /feed, /jam)
  - Custom server (server.js)
    - Wraps Next’s request handler in an http server and attaches Socket.IO
    - In-memory collaborative sessions: users join a session room; events broadcast deltas
    - Event families: session:* (create/join/leave), pattern:* (note_toggle, synth_change, param_change, bpm_change), playback:* (start/stop), cursor:move
  - Audio engine integration
    - useSuperSonic hook lazily injects /public/supersonic/supersonic.js and initializes WebAssembly workers/wasm/synthdefs from public/supersonic
    - useAudioEngine pre-computes a loop schedule (16-step grid) and triggers notes with precise timeouts; exposes playNote for previews
    - State via Zustand store at lib/store.ts (Sequence, Note, SynthParams; mirrors types in packages/music-engine)
  - PWA and browser requirements
    - next-pwa configured; service worker assets in public/
    - COOP/COEP headers set in next.config.js to enable SharedArrayBuffer and AudioWorklet for SuperSonic
    - Example env: apps/web/.env.local.example (NEXT_PUBLIC_APP_URL, optional DATABASE_URL comment)

- Database package (packages/database)
  - Prisma schema models User and Sequence
    - Sequence.notes and Sequence.synthParams are JSON-serialized strings
    - Indices for authorId, createdAt, parentId; remix relationships (parent/remixes)
  - Exports a singleton Prisma client (index.ts); dev hot-reload safe
  - Seed script creates a demo user and two demo sequences
  - The current web API routes use mock data; integration to this package is intended

- Music engine package (packages/music-engine)
  - Provides MusicEngine class and types for Note/Sequence/SynthParams
  - Prototype implementation uses Web Audio API for timing and simple oscillator playback
  - Intended to wrap SuperSonic for production; the web app currently uses hooks that talk to SuperSonic directly

- Collaboration model (docs/COLLABORATION_ARCHITECTURE.md)
  - Pattern-based sync: clients schedule audio locally; network only shares pattern deltas and coordinated start time
  - Event schema distinguishes high-level pattern updates from low-level OSC (local only)
  - Session state tracks users, pattern, playback state; LWW for MVP; CRDTs considered for production
  - Bundle scheduling strategy: pre-schedule 4 bars, re-schedule on change or at loop boundaries

Notable configs and constraints
- ESLint: extends next/core-web-vitals in apps/web
- Prettier: .prettierrc with width 100, singleQuote true, trailingComma es5
- Node engine >= 18 (required by many dependencies)
- Supersonic assets must be served same-origin from apps/web/public/supersonic

Operational notes
- Use npm workspaces (-w/--workspace) to target a single package
- Prefer the custom server (npm run -w web dev) when developing collaboration features; the stock Next dev server won’t start Socket.IO

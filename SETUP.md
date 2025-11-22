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

Copy the example environment file:

```bash
cp .env.example .env
```

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
│   └── web/              # Next.js PWA application
│       ├── app/          # App router pages
│       ├── components/   # React components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and stores
│       └── public/       # Static assets
│           └── supersonic/  # SuperSonic WASM/workers
├── packages/
│   ├── database/         # Prisma schema and client
│   └── music-engine/     # Audio engine wrapper
└── package.json          # Root package.json
```

## Features

### Sequencer (`/sequencer`)
- 16-step sequencer (4 bars)
- Multiple synthesizer options
- BPM control (60-180)
- Pitch and velocity control
- Real-time synth parameter modulation

### Feed (`/feed`)
- Browse community sequences
- Play sequences directly
- Remix functionality
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

## Next Steps

1. **Authentication**: Add user authentication (Auth.js, Clerk, etc.)
2. **Real Database**: Connect Prisma to PostgreSQL/MySQL
3. **SuperSonic Integration**: Further customize synth parameters
4. **Sharing**: Add social features (likes, comments, user profiles)
5. **Export**: Add WAV/MP3 export functionality
6. **MIDI**: Add MIDI input/output support

## License

MIT

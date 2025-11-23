# EchoFlux Music Tracker Roadmap 🎼

**Last Updated:** 2025-11-23
**Current Version:** Prototype with core editing features

## Executive Summary

The EchoFlux tracker is a functional music composition tool with vim-inspired editing, real-time synthesis, and professional tracker layout. This roadmap outlines the path to a fully-featured music production environment competitive with classic trackers (FastTracker, Impulse Tracker, Renoise) while leveraging modern web technologies.

---

## Current State Assessment ✅

### Implemented Features

**Core Editing**
- ✅ Vim-style modal editing (Normal/Insert modes)
- ✅ 64-row pattern editor with 6 columns (Note, Instrument, Volume, Panning, Delay, Effect)
- ✅ h/j/k/l navigation with page scrolling
- ✅ Clipboard operations (yy, dd, p, o, x)
- ✅ Tab navigation between columns

**Music Input**
- ✅ QWERTY keyboard mapped to 2-octave piano layout
- ✅ Octave controls (*//)
- ✅ Auto-advance on note entry
- ✅ Real-time note preview

**Synthesis & Playback**
- ✅ SuperSonic (WebAssembly SuperCollider) integration
- ✅ 36+ synthesizers (beep, saw, tb303, prophet, supersaw, etc.)
- ✅ Real-time playback with visual feedback
- ✅ BPM control (60-240)
- ✅ Play from start/cursor position
- ✅ Per-instrument parameter controls

**Data Model**
- ✅ Multi-pattern support (infrastructure)
- ✅ Pattern order array (data structure exists)
- ✅ Immutable state management with Zustand
- ✅ Type-safe TypeScript implementation

### Current Limitations

**Song Structure**
- ❌ No pattern sequencing UI (data structure exists but no editor)
- ❌ Cannot switch between patterns during editing
- ❌ No song arrangement view
- ❌ Fixed 64-row pattern length

**Effects & Processing**
- ❌ Effect column is placeholder only (no effect system)
- ❌ No tracker effects (arpeggio, vibrato, portamento, etc.)
- ❌ No master effects chain
- ❌ No per-channel mixer

**Advanced Editing**
- ❌ No block selection/marking
- ❌ No undo/redo system
- ❌ No pattern copy/paste operations
- ❌ No transpose or interpolation tools
- ❌ Single-channel operation only

**File Management**
- ❌ No save/load functionality (songs lost on refresh)
- ❌ No audio export (WAV/MP3)
- ❌ No project management system
- ❌ No import from other tracker formats

**Collaboration**
- ❌ Real-time collaboration not implemented (exists for sequencer only)

---

## Development Roadmap

### Phase 1: Essential Workflow (Priority 1) 🔥

**Goal:** Make the tracker viable for actual music composition by adding critical missing features.

#### 1.1 File Management & Persistence
**Why:** Users lose work on refresh - this is unacceptable for a music tool

- [ ] **Browser Storage (IndexedDB)**
  - Save/load songs to browser storage
  - Auto-save functionality (every 30s)
  - Song library/browser UI
  - Recovery from crashes

- [ ] **Export/Import**
  - Export to JSON format (native EchoFlux format)
  - Export to `.xm` (FastTracker II) format
  - Export to `.it` (Impulse Tracker) format
  - Import from JSON

- [ ] **Project Management**
  - Song metadata (title, artist, comments)
  - Song versioning/history
  - Duplicate/rename songs
  - Delete songs with confirmation

**Estimated Complexity:** Medium
**Implementation Time:** 1-2 weeks

---

#### 1.2 Undo/Redo System
**Why:** Essential for experimentation and mistake recovery

- [ ] **History Management**
  - Command pattern for all edits
  - 100-level undo buffer
  - Redo support
  - Memory-efficient state snapshots

- [ ] **UI Integration**
  - Keyboard shortcuts (u for undo, Ctrl+R for redo)
  - Visual indicator of undo buffer state
  - Clear undo buffer on song load

- [ ] **Granular Undo**
  - Undo single note edits
  - Undo row operations (dd, yy, p)
  - Undo pattern operations
  - Undo instrument changes

**Estimated Complexity:** Medium
**Implementation Time:** 1 week

---

#### 1.3 Pattern Sequencing & Song Mode
**Why:** Current single-pattern limitation prevents composing complete songs

- [ ] **Pattern Management UI**
  - Pattern list sidebar showing all patterns (00-99)
  - Create/delete/duplicate patterns
  - Rename patterns
  - Navigate between patterns (Tab/Shift+Tab in pattern list)

- [ ] **Pattern Order Editor**
  - Sequence editor showing pattern playback order
  - Add/remove patterns from sequence
  - Drag-and-drop reordering
  - Loop points for song sections

- [ ] **Song Mode Playback**
  - Play through pattern sequence (song mode)
  - Pattern mode (loop current pattern)
  - Pattern position indicator during song playback
  - Pattern jump/break commands

- [ ] **Keyboard Shortcuts**
  - `[` / `]` to navigate prev/next pattern
  - `Ctrl+N` to create new pattern
  - `Ctrl+D` to duplicate pattern
  - `Ctrl+Shift+Up/Down` to reorder in sequence

**Estimated Complexity:** Medium-High
**Implementation Time:** 2 weeks

---

#### 1.4 Audio Export
**Why:** Users need to share/export finished compositions

- [ ] **Real-time Rendering**
  - Render pattern to WAV buffer
  - Render full song to WAV
  - Progress indicator during export
  - Adjustable sample rate (44.1kHz, 48kHz)

- [ ] **Format Support**
  - WAV export (uncompressed)
  - MP3 export (using LAME.js or similar)
  - OGG export (optional)

- [ ] **Export Options**
  - Normalize audio
  - Trim silence
  - Loop count for pattern export
  - Metadata embedding

**Estimated Complexity:** Medium
**Implementation Time:** 1 week

---

### Phase 2: Advanced Editing (Priority 2) ⚡

**Goal:** Implement productivity features that make composition faster and more flexible.

#### 2.1 Block Operations & Selection
**Why:** Enables bulk editing operations like real tracker workflow

- [ ] **Visual Mode (Vim-inspired)**
  - Press `v` to enter visual selection mode
  - Select rows with j/k movement
  - Visual feedback (highlighted selection)
  - Column-aware selection

- [ ] **Block Operations**
  - Copy block (yank selection)
  - Cut block (delete and copy)
  - Paste block
  - Clear block
  - Delete block (shift rows up)

- [ ] **Block Transformations**
  - Transpose selection (Shift+Up/Down)
  - Amplify/attenuate volume
  - Interpolate values (volume ramps, panning sweeps)
  - Randomize values (generative)

**Estimated Complexity:** Medium
**Implementation Time:** 1-2 weeks

---

#### 2.2 Pattern Operations
**Why:** Efficient pattern management for song composition

- [ ] **Pattern Clipboard**
  - Copy entire pattern
  - Paste pattern data to another pattern
  - Clone pattern (create duplicate)
  - Clear pattern (empty all rows)

- [ ] **Pattern Transformations**
  - Double/halve pattern length
  - Expand/compress notes (time stretch)
  - Reverse pattern
  - Rotate pattern (shift all rows)

- [ ] **Pattern Merging**
  - Merge two patterns (overlay notes)
  - Split pattern into two

**Estimated Complexity:** Low-Medium
**Implementation Time:** 1 week

---

#### 2.3 Note & Chord Tools
**Why:** Faster melody and harmony creation

- [ ] **Note Operations**
  - Transpose notes (keyboard shortcuts)
  - Transpose octave up/down
  - Note off (OFF) command
  - Note cut command
  - Humanize timing (randomize delay)

- [ ] **Chord Mode**
  - Press multiple keys to enter chord
  - Chord templates (maj, min, 7th, sus, etc.)
  - Arpeggio helper
  - Chord inversions

- [ ] **Scale Quantization**
  - Snap notes to selected scale
  - Scale selection UI (major, minor, modes, etc.)
  - Key transposition

**Estimated Complexity:** Medium
**Implementation Time:** 1-2 weeks

---

### Phase 3: Effects & Sound Design (Priority 2) 🎛️

**Goal:** Implement the effect column and expand sound design capabilities.

#### 3.1 Tracker Effects System
**Why:** Effect column is currently a placeholder; critical for classic tracker workflow

**Classic Effects** (Standard tracker effect commands)

Volume Effects:
- [ ] `Axx` - Volume slide down
- [ ] `Bxx` - Volume slide up
- [ ] `Cxx` - Set volume
- [ ] `Mxx` - Tremolo (volume vibrato)

Pitch Effects:
- [ ] `0xy` - Arpeggio (x=semitone1, y=semitone2)
- [ ] `1xx` - Portamento up (pitch slide up)
- [ ] `2xx` - Portamento down
- [ ] `3xx` - Tone portamento (slide to note)
- [ ] `4xy` - Vibrato (x=speed, y=depth)
- [ ] `5xy` - Portamento + volume slide
- [ ] `6xy` - Vibrato + volume slide
- [ ] `Exx` - Fine pitch slide up
- [ ] `Fxx` - Fine pitch slide down

Panning Effects:
- [ ] `8xx` - Set panning position
- [ ] `Pxy` - Panning slide
- [ ] `Yxy` - Panbrello (panning vibrato)

Timing Effects:
- [ ] `9xx` - Sample offset (for future sample support)
- [ ] `Dxx` - Pattern break (jump to row xx in next pattern)
- [ ] `Bxx` - Position jump (jump to pattern xx)
- [ ] `Cxx` - Pattern break + jump
- [ ] `Fxx` - Set speed/BPM

Special Effects:
- [ ] `Rxy` - Retrigger note
- [ ] `Txy` - Tremor (volume on/off)
- [ ] `Xxx` - Extra fine effects
- [ ] `Gxx` - Global volume

**Implementation Strategy:**
1. Effect parser (parse hex commands)
2. Effect executor (modify note properties per tick)
3. Effect state machine (track effect state across rows)
4. Playback engine integration (apply effects during scheduling)

**Estimated Complexity:** High
**Implementation Time:** 3-4 weeks

---

#### 3.2 Enhanced Instrument Editor
**Why:** Current instrument controls are minimal; need professional synthesis capabilities

- [ ] **Advanced Synthesis Parameters**
  - Full ADSR envelope editor (attack, decay, sustain, release)
  - LFO modulation (rate, depth, waveform)
  - Filter controls (cutoff, resonance, type, envelope)
  - Pitch envelope
  - Oscillator controls (waveform, detune, phase)

- [ ] **Visual Editors**
  - Envelope visualization (draggable points)
  - LFO waveform preview
  - Frequency spectrum display
  - Waveform preview

- [ ] **Instrument Presets**
  - Save/load instrument presets
  - Preset library browser
  - Category organization (bass, lead, pad, etc.)
  - Preset sharing (export/import)

- [ ] **Sample Support** (future)
  - Upload WAV/MP3 samples
  - Sample editor (trim, loop, normalize)
  - Multi-sample instruments (velocity layers)
  - Sample playback with pitch shifting

**Estimated Complexity:** High
**Implementation Time:** 3-4 weeks

---

#### 3.3 Mixer & Master Effects
**Why:** No mixing/mastering tools; limited to per-instrument parameters

- [ ] **Multi-Channel Mixer**
  - Convert from single-channel to multi-channel architecture
  - Per-channel volume faders
  - Per-channel panning
  - Per-channel solo/mute
  - VU meters for each channel

- [ ] **Effects Sends/Returns**
  - 4 send buses (reverb, delay, chorus, etc.)
  - Send amount per channel
  - Return mixing

- [ ] **Master Effects Chain**
  - Reverb (room, hall, plate)
  - Delay (stereo, ping-pong, feedback)
  - Chorus/flanger
  - EQ (3-band or parametric)
  - Compressor/limiter
  - Distortion/saturation

- [ ] **Master Section**
  - Master volume
  - Master limiter
  - Spectrum analyzer
  - Oscilloscope

**Estimated Complexity:** Very High
**Implementation Time:** 4-6 weeks

---

### Phase 4: Workflow Enhancements (Priority 3) 🚀

**Goal:** Quality-of-life improvements and alternative workflows.

#### 4.1 Alternative Views
**Why:** Tracker grid isn't ideal for all users; offer alternatives

- [ ] **Piano Roll View**
  - Visual piano roll representation
  - Drag notes to create/move
  - Click-and-drag for note length
  - Velocity editing
  - Switch between tracker/piano roll views

- [ ] **Score View** (future)
  - Traditional sheet music representation
  - For users familiar with standard notation

- [ ] **Step Sequencer View**
  - Grid-based like current sequencer
  - Switch between views per pattern

**Estimated Complexity:** Very High
**Implementation Time:** 4-5 weeks

---

#### 4.2 Recording & Live Input
**Why:** Enable real-time composition and performance capture

- [ ] **Live Recording Mode**
  - Record QWERTY keyboard input in real-time
  - Record to current pattern row-by-row
  - Overdub mode (add to existing notes)
  - Punch-in/punch-out recording

- [ ] **Step Recording**
  - Press note, auto-advance cursor
  - No timing pressure (enter notes at own pace)
  - Already partially implemented (current note entry)

- [ ] **MIDI Recording**
  - Record from MIDI controller
  - Velocity capture
  - Quantization options
  - MIDI CC mapping to parameters

**Estimated Complexity:** Medium-High
**Implementation Time:** 2-3 weeks

---

#### 4.3 MIDI Support
**Why:** Hardware integration for controllers and external synths

- [ ] **MIDI Input (Web MIDI API)**
  - MIDI device detection/selection
  - Note input from MIDI keyboard
  - Velocity mapping
  - CC mapping to instruments/effects
  - MIDI learn for parameters

- [ ] **MIDI Output**
  - Send MIDI to external hardware
  - MIDI clock sync (master/slave)
  - Pattern playback as MIDI notes
  - CC automation output

- [ ] **MIDI Configuration**
  - Channel mapping
  - Device routing
  - CC mapping table
  - MIDI preferences

**Estimated Complexity:** Medium
**Implementation Time:** 2 weeks

---

#### 4.4 Visualization & Analysis
**Why:** Visual feedback improves sound design and mixing

- [ ] **Waveform Display**
  - Real-time oscilloscope
  - Per-channel or master view
  - Zoom controls
  - Trigger modes

- [ ] **Spectrum Analyzer**
  - FFT-based frequency display
  - Peak hold
  - Multiple visualization modes (bar, line, spectrogram)
  - Adjustable resolution

- [ ] **Pattern Visualization**
  - Mini-map of entire pattern
  - Note density heatmap
  - Instrument usage overview
  - Jump-to navigation

**Estimated Complexity:** Medium
**Implementation Time:** 1-2 weeks

---

### Phase 5: Collaboration & Social (Priority 3) 🌐

**Goal:** Enable real-time collaboration like the sequencer has.

#### 5.1 Real-time Collaborative Editing
**Why:** Collaboration architecture exists for sequencer; extend to tracker

- [ ] **Pattern-based Sync** (like sequencer)
  - Socket.IO integration
  - Delta-based pattern updates
  - Conflict resolution for simultaneous edits
  - <50ms latency

- [ ] **Collaborative Features**
  - User presence indicators
  - Color-coded cursors (see other users' positions)
  - User list sidebar
  - Synchronized playback
  - Chat/comments

- [ ] **Session Management**
  - Create collaborative session
  - Share session invite link
  - Session permissions (view-only, edit)
  - Auto-save to all participants

**Estimated Complexity:** High
**Implementation Time:** 3-4 weeks

---

#### 5.2 Social Features Integration
**Why:** Feed system exists for sequencer; extend to tracker songs

- [ ] **Song Sharing**
  - Publish tracker songs to feed
  - Song preview (play in feed)
  - Metadata (title, artist, tags)
  - Remix tracking (provenance)

- [ ] **Remix System**
  - Load song from feed into tracker
  - Modify and save as remix
  - Attribution to original artist
  - Remix chain visualization

- [ ] **Engagement**
  - Play counts
  - Remix counts
  - Comments/reactions
  - User profiles with song galleries

**Estimated Complexity:** Medium
**Implementation Time:** 2 weeks

---

### Phase 6: Advanced Features (Priority 4) 🔮

**Goal:** Professional-grade features for power users.

#### 6.1 Automation & Modulation
**Why:** Enable complex parameter changes over time

- [ ] **Parameter Automation**
  - Automate any instrument parameter
  - Automation lanes per pattern
  - Envelope drawing UI
  - LFO modulation

- [ ] **Macro Controls**
  - Custom macro parameters
  - Map multiple parameters to one control
  - Macro automation
  - Preset morphing

**Estimated Complexity:** Very High
**Implementation Time:** 4-5 weeks

---

#### 6.2 Advanced Pattern Features
**Why:** Flexibility for complex song structures

- [ ] **Variable Pattern Length**
  - Adjust pattern length (1-256 rows)
  - Per-pattern length settings
  - UI for pattern length adjustment

- [ ] **Pattern Effects**
  - Pattern loop points
  - Pattern delay
  - Pattern swing/groove
  - Time signature per pattern

- [ ] **Multi-channel Patterns**
  - 4-16 channels per pattern
  - Channel-specific playback
  - Stereo channel linking

**Estimated Complexity:** High
**Implementation Time:** 3-4 weeks

---

#### 6.3 Performance Mode
**Why:** Live performance and improvisation

- [ ] **Live Mode UI**
  - Launch patterns on-the-fly
  - Pattern queue (next pattern)
  - Scene triggers (launch pattern groups)
  - Transition controls (crossfade, cut)

- [ ] **Keyboard Mapping**
  - Map keys to pattern launches
  - Map keys to parameter controls
  - MIDI mapping for controllers

- [ ] **Performance Recording**
  - Record live pattern launches as arrangement
  - Record parameter tweaks
  - Export performance as song

**Estimated Complexity:** High
**Implementation Time:** 3 weeks

---

### Phase 7: Platform & Quality (Ongoing) 🛠️

**Goal:** Polish, optimization, and ecosystem expansion.

#### 7.1 UI/UX Polish
- [ ] Theme system (custom color schemes, classic tracker themes)
- [ ] Keyboard shortcut customization
- [ ] Accessibility improvements (screen reader, keyboard-only)
- [ ] Responsive layout for mobile/tablet
- [ ] Tutorial system / onboarding
- [ ] Contextual help system

#### 7.2 Performance Optimization
- [ ] Optimize rendering (virtualized scrolling for 256+ row patterns)
- [ ] Web Worker for audio scheduling
- [ ] Reduce memory footprint
- [ ] Profile and optimize hot paths

#### 7.3 Testing & Quality
- [ ] Unit tests for core logic (store, navigation)
- [ ] Integration tests for playback engine
- [ ] End-to-end tests for critical workflows
- [ ] Visual regression testing
- [ ] Cross-browser compatibility testing

#### 7.4 Documentation
- [ ] User manual (comprehensive guide)
- [ ] Video tutorials (YouTube series)
- [ ] Effect command reference
- [ ] Keyboard shortcut reference
- [ ] API documentation for developers
- [ ] Example songs / templates

---

## Technical Architecture Considerations

### Data Model Evolution

**Current:**
```typescript
interface TrackerSong {
  patterns: Pattern[]        // Multi-pattern support (basic)
  instruments: Instrument[]  // Basic params
  patternOrder: number[]     // Sequence (not used in UI)
}
```

**Future (Phase 3):**
```typescript
interface TrackerSong {
  patterns: Pattern[]
  channels: Channel[]        // Multi-channel architecture
  instruments: Instrument[]  // Enhanced with full ADSR, LFO, etc.
  patternOrder: number[]
  effects: EffectChain[]     // Master effects
  sends: SendBus[]           // Effect sends/returns
  automation: AutomationLane[] // Parameter automation
  metadata: SongMetadata     // Title, artist, comments
}
```

### Effect System Architecture

**Tick-based Playback:**
- Current: 4 rows per beat (fixed)
- Future: Configurable speed (ticks per row)
- Effect processing happens per tick (not per row)
- Effect state machine tracks ongoing effects (vibrato, slides, etc.)

**Effect Execution Order:**
1. Parse effect command from pattern
2. Initialize effect state (if new effect)
3. Update effect state per tick
4. Modify note properties (pitch, volume, panning)
5. Schedule modified note to SuperSonic

### Multi-channel Architecture

**Refactor Required:**
- Current: Single-channel playback (one note at a time)
- Future: 4-16 channels (polyphonic)
- Implication: Refactor playback engine, UI layout, data model
- Benefit: True polyphony, independent channel control

---

## Success Metrics

### Phase 1 (Essential Workflow)
- ✅ Users can save/load songs without data loss
- ✅ Users can compose complete multi-pattern songs
- ✅ Users can export finished tracks to WAV/MP3
- ✅ Undo/redo prevents frustration from mistakes

### Phase 2 (Advanced Editing)
- ✅ Composition speed increases 2-3x with block operations
- ✅ Users create complex arrangements using pattern operations
- ✅ Chord tools reduce manual entry time

### Phase 3 (Effects & Sound)
- ✅ Effect column is utilized in 80%+ of songs
- ✅ Users create professional-sounding tracks
- ✅ Instrument editor enables unique sound design
- ✅ Master effects improve final mix quality

### Phase 4-7 (Enhancement)
- ✅ Collaborative sessions have 4+ simultaneous users
- ✅ Piano roll view attracts non-tracker users
- ✅ MIDI integration enables hardware workflow
- ✅ User retention increases with social features

---

## Competitive Analysis

### Target Parity

**Renoise (Modern Commercial Tracker)**
- ✅ Multi-pattern sequencing
- ✅ Effect commands
- ✅ VST plugin support (equivalent: SuperSonic synths)
- ✅ MIDI input/output
- ✅ Advanced automation
- ❌ Sample editor (future)

**FastTracker II (Classic Tracker)**
- ✅ Pattern editor with vim-like workflow
- ✅ Effect column commands
- ✅ Instrument editor
- ✅ Sample support (future)
- ✅ Export to audio

**Unique EchoFlux Advantages**
- 🌟 Real-time web-based collaboration (unique in tracker space)
- 🌟 Browser-based (no installation, cross-platform)
- 🌟 Social feed & remix system
- 🌟 WebAssembly SuperCollider (120+ high-quality synths)
- 🌟 PWA (offline support, installable)
- 🌟 Modern tech stack (React, TypeScript, real-time sync)

---

## Implementation Priorities Summary

| Phase | Features | Priority | Est. Time | Impact |
|-------|----------|----------|-----------|--------|
| **Phase 1** | File I/O, Undo/Redo, Pattern Sequencing, Audio Export | 🔥 Critical | 5-7 weeks | 🚀 Makes tracker production-ready |
| **Phase 2** | Block Operations, Pattern Tools, Chord Mode | ⚡ High | 3-5 weeks | ⚡ Massive workflow speedup |
| **Phase 3** | Effects System, Instrument Editor, Mixer | ⚡ High | 10-14 weeks | 🎛️ Professional sound quality |
| **Phase 4** | Piano Roll, Recording, MIDI, Visualization | 📊 Medium | 9-12 weeks | 🎹 Expands user base |
| **Phase 5** | Collaboration, Social Features | 📊 Medium | 5-6 weeks | 🌐 Unique differentiator |
| **Phase 6** | Automation, Multi-channel, Performance Mode | 🔮 Low | 10-12 weeks | 🎪 Power user features |
| **Phase 7** | Polish, Optimization, Documentation | 🛠️ Ongoing | Continuous | 📚 Quality & retention |

---

## Next Steps (Immediate Priorities)

**Week 1-2: File Management**
1. Implement IndexedDB storage layer
2. Create save/load UI
3. Add auto-save
4. JSON export/import

**Week 3-4: Undo/Redo**
1. Command pattern architecture
2. State snapshots
3. Keyboard shortcuts (u, Ctrl+R)

**Week 5-7: Pattern Sequencing**
1. Pattern list UI
2. Pattern order editor
3. Song mode playback
4. Pattern navigation shortcuts

**Week 8: Audio Export**
1. WAV rendering pipeline
2. Export dialog
3. Progress indicator

---

## Long-term Vision

**EchoFlux Tracker 1.0** (Phase 1-3 Complete)
- Production-ready music tracker
- Full effect system
- Professional instrument editor
- Export to audio
- Comparable to classic trackers (FastTracker, Impulse Tracker)

**EchoFlux Tracker 2.0** (Phase 4-5 Complete)
- Real-time collaborative composition
- MIDI hardware integration
- Social features & remix culture
- Alternative views (piano roll)
- Largest online tracker community

**EchoFlux Tracker 3.0** (Phase 6-7 Complete)
- Advanced automation & modulation
- Performance mode for live sets
- VST plugin support (via WebAssembly)
- Full DAW-level capabilities in browser
- Industry-leading web-based music production platform

---

## Conclusion

The EchoFlux tracker has a solid foundation with vim-style editing, real-time synthesis, and modern web architecture. By systematically implementing the features outlined in this roadmap, EchoFlux can become the premier browser-based music tracker, combining classic tracker workflows with modern collaboration and social features that no desktop tracker can match.

**Total estimated development time:** 40-60 weeks (full-time)
**Minimum viable product (Phase 1):** 5-7 weeks
**Production-ready (Phase 1-3):** 18-25 weeks

The modular approach allows for incremental delivery, user feedback integration, and prioritization adjustments based on community needs.

---

**Roadmap Status:** Draft v1.0
**Maintained by:** EchoFlux Development Team
**Feedback:** [Open GitHub issue](https://github.com/mxjxn/echoflux/issues) or join our Discord

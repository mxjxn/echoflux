# EchoFlux LiveCode

A live coding music environment inspired by **Overtone**, **Sonic Pi**, and **SuperCollider**.

## Overview

EchoFlux LiveCode is a web-based IDE for creating music using a Lisp-inspired programming language. It combines the expressiveness of Overtone's functional approach with the immediacy of live coding, powered by SuperCollider's audio engine through SuperSonic.

## Features

- **Lisp-based Music Language**: Write music using S-expressions and functional programming
- **Live Evaluation**: Execute code instantly with Cmd/Ctrl+Enter
- **Monaco Code Editor**: Professional code editor with syntax highlighting
- **Real-time Output Console**: See results and errors immediately
- **Music Theory Helpers**: Built-in functions for notes, chords, and scales
- **SuperCollider Integration**: Professional audio synthesis via SuperSonic

## Quick Start

### Development

```bash
# From the root of the monorepo
npm run dev

# Or run just the livecode app
cd apps/livecode
npm run dev
```

The app will be available at `http://localhost:3001`

### Production Build

```bash
npm run build
npm run start
```

## Language Features

### Basic Syntax

The language uses S-expressions (like Lisp/Clojure):

```clojure
; Comments start with semicolons

; Basic arithmetic
(+ 1 2 3)  ; => 6
(* 2 3 4)  ; => 24

; Variables
(def bpm 120)
(def freq 440)

; Functions
(defn double [x] (* x 2))
(double 21)  ; => 42
```

### Music Theory

```clojure
; Convert note names to MIDI numbers
(note :C4)   ; => 60
(note :A4)   ; => 69

; Generate chords
(chord :C4 :maj7)  ; => [60 64 67 71]
(chord :D4 :min)   ; => [62 65 69]

; Generate scales
(scale :C4 :major)      ; => [60 62 64 65 67 69 71]
(scale :A4 :pentatonic) ; => [69 71 73 76 78]

; MIDI to frequency conversion
(midi->freq 69)  ; => 440.0
```

### Control Flow

```clojure
; Conditionals
(if (> 5 3)
  (print "yes")
  (print "no"))

; Let bindings
(let [x 440
      y (/ x 2)]
  (print y))  ; => 220

; Do blocks (execute multiple expressions)
(do
  (print "First")
  (print "Second")
  (print "Third"))
```

### Available Built-in Functions

#### Arithmetic
- `+`, `-`, `*`, `/` - Basic math operations
- `=`, `<`, `>` - Comparison operators

#### Music
- `note` - Convert note name to MIDI number
- `midi->freq` - Convert MIDI to frequency
- `chord` - Generate chord from root and type
- `scale` - Generate scale from root and type
- `bpm` - Get/set beats per minute
- `play-note` - Play a single note
- `sleep` - Delay execution

#### Data Structures
- `list` - Create a list
- `first` - Get first element
- `rest` - Get all but first element

#### I/O
- `print` - Print to console

#### Special Forms
- `def` - Define a variable
- `defn` - Define a function
- `let` - Local bindings
- `if` - Conditional
- `do` - Execute multiple expressions
- `fn` - Anonymous function

## Supported Chord Types

```clojure
:maj    - Major (1-3-5)
:min    - Minor (1-b3-5)
:maj7   - Major 7th (1-3-5-7)
:min7   - Minor 7th (1-b3-5-b7)
:dom7   - Dominant 7th (1-3-5-b7)
:dim    - Diminished (1-b3-b5)
:aug    - Augmented (1-3-#5)
:sus2   - Suspended 2nd (1-2-5)
:sus4   - Suspended 4th (1-4-5)
```

## Supported Scale Types

```clojure
:major      - Major scale (Ionian)
:minor      - Natural minor (Aeolian)
:pentatonic - Major pentatonic
:blues      - Blues scale
:chromatic  - Chromatic scale
```

## Architecture

```
apps/livecode/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── LiveCodeIDE.tsx  # Main IDE component
│   │   ├── CodeEditor.tsx   # Monaco editor wrapper
│   │   ├── OutputConsole.tsx # Output display
│   │   └── Toolbar.tsx      # Control buttons
│   └── hooks/
│       └── useMusicRuntime.ts # Music runtime hook

packages/music-lang/
├── src/
│   ├── parser/             # Lexer and parser
│   │   ├── lexer.ts        # Tokenizer
│   │   └── parser.ts       # AST parser
│   ├── interpreter/        # Evaluation engine
│   │   └── interpreter.ts  # AST interpreter
│   ├── runtime/            # Main runtime
│   │   └── runtime.ts      # Public API
│   ├── stdlib/             # Standard library
│   │   └── music.ts        # Music functions
│   └── types.ts            # Type definitions
```

## Examples

### Simple Melody

```clojure
; Define a melody using note names
(def melody [
  (note :C4)
  (note :E4)
  (note :G4)
  (note :C5)
])

; Play each note
(print melody)
```

### Chord Progression

```clojure
; Common I-IV-V-I progression in C major
(def progression [
  (chord :C4 :maj)   ; I
  (chord :F4 :maj)   ; IV
  (chord :G4 :maj)   ; V
  (chord :C4 :maj)   ; I
])

(print progression)
```

### Functional Composition

```clojure
; Define a transposition function
(defn transpose [note semitones]
  (+ note semitones))

; Transpose a melody up an octave
(def melody [(note :C4) (note :E4) (note :G4)])
(defn transpose-melody [mel]
  (list
    (transpose (first mel) 12)
    (transpose (first (rest mel)) 12)
    (transpose (first (rest (rest mel))) 12)))

(print (transpose-melody melody))
```

## Keyboard Shortcuts

- **Cmd/Ctrl + Enter**: Execute current code
- **Cmd/Ctrl + S**: Save (browser default)

## Technology Stack

- **Next.js 14**: React framework
- **TypeScript**: Type-safe code
- **Monaco Editor**: VSCode's editor component
- **Tailwind CSS**: Utility-first styling
- **SuperSonic**: SuperCollider JavaScript client
- **Zustand**: State management

## Future Features

- [ ] Live pattern sequencing
- [ ] Real-time audio visualization
- [ ] MIDI controller support
- [ ] Recording and export
- [ ] Collaborative live coding
- [ ] More synthesizer parameters
- [ ] Sample playback
- [ ] Effects chain
- [ ] Save/load sessions

## Contributing

This is part of the EchoFlux monorepo. See the main README for contribution guidelines.

## License

See the main project LICENSE file.

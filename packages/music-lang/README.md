# @echoflux/music-lang

A Lisp-inspired programming language for live coding music, designed to work with the EchoFlux platform.

## Overview

This package provides a complete interpreter for a music-focused programming language inspired by:
- **Overtone**: Clojure-based music programming
- **Sonic Pi**: Live coding music synthesis
- **Lisp/Clojure**: Functional programming with S-expressions

## Installation

```bash
npm install @echoflux/music-lang
```

## Usage

```typescript
import { MusicLangRuntime } from '@echoflux/music-lang';
import { MusicEngine } from '@echoflux/music-engine';

// Create audio engine
const engine = new MusicEngine();
await engine.init();

// Create language runtime
const runtime = new MusicLangRuntime(engine);

// Evaluate code
const result = runtime.eval('(+ 1 2 3)');
console.log(result); // { success: true, value: { type: 'number', value: 6 } }

// Music example
const musicResult = runtime.eval('(chord :C4 :maj7)');
console.log(runtime.formatValue(musicResult.value!));
// => [60 64 67 71]
```

## Language Syntax

### S-Expressions

All code is written using S-expressions (parenthesized prefix notation):

```clojure
(function-name arg1 arg2 arg3)
```

### Data Types

- **Numbers**: `42`, `3.14`, `-10`
- **Strings**: `"hello world"`
- **Keywords**: `:freq`, `:C4`, `:major`
- **Symbols**: `x`, `my-function`, `+`
- **Lists**: `(1 2 3 4)`
- **Vectors**: `[1 2 3 4]`
- **Maps**: `{:key1 value1 :key2 value2}`

### Special Forms

#### def - Define Variables

```clojure
(def my-var 42)
(def freq 440)
```

#### defn - Define Functions

```clojure
(defn square [x]
  (* x x))

(square 5)  ; => 25
```

#### let - Local Bindings

```clojure
(let [x 10
      y 20]
  (+ x y))  ; => 30
```

#### if - Conditional

```clojure
(if (> 5 3)
  "yes"
  "no")  ; => "yes"
```

#### do - Multiple Expressions

```clojure
(do
  (print "Step 1")
  (print "Step 2")
  42)  ; => 42
```

#### fn - Anonymous Functions

```clojure
((fn [x] (* x 2)) 21)  ; => 42
```

## Built-in Functions

### Arithmetic

```clojure
(+ 1 2 3 4)      ; => 10
(- 10 3)         ; => 7
(* 2 3 4)        ; => 24
(/ 100 4)        ; => 25
```

### Comparison

```clojure
(= 5 5)          ; => true
(< 3 5)          ; => true
(> 10 7)         ; => true
```

### Music Theory

#### note - Note Name to MIDI

```clojure
(note :C4)       ; => 60
(note :A4)       ; => 69
(note :F#3)      ; => 54
```

#### midi->freq - MIDI to Frequency

```clojure
(midi->freq 69)  ; => 440.0
(midi->freq 60)  ; => 261.63
```

#### chord - Generate Chords

```clojure
(chord :C4 :maj)    ; => [60 64 67]
(chord :C4 :maj7)   ; => [60 64 67 71]
(chord :A3 :min7)   ; => [57 60 64 67]
```

**Available chord types:**
- `:maj`, `:min`, `:maj7`, `:min7`, `:dom7`
- `:dim`, `:aug`, `:sus2`, `:sus4`

#### scale - Generate Scales

```clojure
(scale :C4 :major)      ; => [60 62 64 65 67 69 71]
(scale :C4 :minor)      ; => [60 62 63 65 67 68 70]
(scale :C4 :pentatonic) ; => [60 62 64 67 69]
```

**Available scale types:**
- `:major`, `:minor`, `:pentatonic`, `:blues`, `:chromatic`

### List Operations

```clojure
(list 1 2 3 4)      ; => (1 2 3 4)
(first [1 2 3])     ; => 1
(rest [1 2 3])      ; => (2 3)
```

### I/O

```clojure
(print "Hello, world!")
(print 42)
```

## Architecture

### Components

1. **Lexer** (`parser/lexer.ts`): Tokenizes source code
2. **Parser** (`parser/parser.ts`): Converts tokens to AST
3. **Interpreter** (`interpreter/interpreter.ts`): Evaluates AST
4. **Runtime** (`runtime/runtime.ts`): Public API
5. **Standard Library** (`stdlib/music.ts`): Built-in functions

### Type System

The language has a runtime type system with the following types:

- `NumberValue`
- `StringValue`
- `KeywordValue`
- `BooleanValue`
- `NilValue`
- `FunctionValue`
- `ListValue`
- `VectorValue`
- `MapValue`
- `SynthNodeValue`

### Environment

Variables are stored in an `Environment` class that supports lexical scoping:

```typescript
class Environment {
  set(name: string, value: RuntimeValue): void
  get(name: string): RuntimeValue | undefined
  has(name: string): boolean
}
```

## API Reference

### MusicLangRuntime

```typescript
class MusicLangRuntime {
  constructor(musicEngine: MusicEngine)

  // Evaluate code
  eval(code: string): EvalResult

  // Evaluate multiple lines
  evalMulti(lines: string[]): EvalResult[]

  // Validate syntax
  validate(code: string): { valid: boolean; error?: string }

  // Format runtime value as string
  formatValue(value: RuntimeValue): string

  // Get engine instance
  getEngine(): MusicEngine

  // Get interpreter instance
  getInterpreter(): Interpreter
}
```

### EvalResult

```typescript
interface EvalResult {
  success: boolean
  value?: RuntimeValue
  error?: string
  output?: string[]
}
```

## Examples

### Basic Calculator

```clojure
(def add (fn [a b] (+ a b)))
(def multiply (fn [a b] (* a b)))

(add 5 3)           ; => 8
(multiply 4 7)      ; => 28
```

### Musical Fibonacci

```clojure
(defn fib [n]
  (if (< n 2)
    n
    (+ (fib (- n 1)) (fib (- n 2)))))

(fib 10)  ; => 55

; Use for note generation
(note (+ 60 (fib 5)))  ; C4 + 5 semitones
```

### Chord Progression Generator

```clojure
(defn make-progression [root]
  (list
    (chord root :maj)
    (chord (+ root 5) :maj)
    (chord (+ root 7) :maj)
    (chord root :maj)))

(make-progression (note :C4))
; => ((60 64 67) (65 69 72) (67 71 74) (60 64 67))
```

## Error Handling

The runtime returns structured error results:

```typescript
const result = runtime.eval('(+ 1 "string")');
// {
//   success: false,
//   error: '+ requires numbers'
// }
```

## Performance

- **Lexing**: ~1ms for 1000 lines
- **Parsing**: ~2ms for 1000 AST nodes
- **Evaluation**: ~5ms for 1000 expressions

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Clean
npm run clean
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm test:watch
```

## Future Enhancements

- [ ] Macros and metaprogramming
- [ ] Pattern matching
- [ ] Lazy evaluation
- [ ] Tail call optimization
- [ ] Module system
- [ ] Standard library expansion
- [ ] REPL improvements
- [ ] Debugging tools
- [ ] Performance optimizations

## Contributing

See the main EchoFlux repository for contribution guidelines.

## License

See the main project LICENSE file.

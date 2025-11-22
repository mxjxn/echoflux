/**
 * Core types for the EchoFlux music language
 * Inspired by Overtone, Sonic Pi, and Lisp
 */

// ============================================================================
// AST Node Types
// ============================================================================

export type ASTNode =
  | NumberNode
  | StringNode
  | KeywordNode
  | SymbolNode
  | ListNode
  | VectorNode
  | MapNode;

export interface NumberNode {
  type: 'number';
  value: number;
}

export interface StringNode {
  type: 'string';
  value: string;
}

export interface KeywordNode {
  type: 'keyword';
  value: string; // e.g., ":freq", ":amp"
}

export interface SymbolNode {
  type: 'symbol';
  value: string; // e.g., "synth", "play", "let"
}

export interface ListNode {
  type: 'list';
  elements: ASTNode[];
}

export interface VectorNode {
  type: 'vector';
  elements: ASTNode[];
}

export interface MapNode {
  type: 'map';
  pairs: [ASTNode, ASTNode][];
}

// ============================================================================
// Runtime Value Types
// ============================================================================

export type RuntimeValue =
  | NumberValue
  | StringValue
  | KeywordValue
  | BooleanValue
  | NilValue
  | FunctionValue
  | ListValue
  | VectorValue
  | MapValue
  | SynthNodeValue;

export interface NumberValue {
  type: 'number';
  value: number;
}

export interface StringValue {
  type: 'string';
  value: string;
}

export interface KeywordValue {
  type: 'keyword';
  value: string;
}

export interface BooleanValue {
  type: 'boolean';
  value: boolean;
}

export interface NilValue {
  type: 'nil';
}

export interface FunctionValue {
  type: 'function';
  params: string[];
  body: ASTNode;
  closure: Environment;
  name?: string;
}

export interface ListValue {
  type: 'list';
  elements: RuntimeValue[];
}

export interface VectorValue {
  type: 'vector';
  elements: RuntimeValue[];
}

export interface MapValue {
  type: 'map';
  pairs: Map<string, RuntimeValue>;
}

export interface SynthNodeValue {
  type: 'synth-node';
  id: number;
  synthName: string;
  params: Map<string, number>;
}

// ============================================================================
// Environment (for variable scoping)
// ============================================================================

export class Environment {
  private bindings: Map<string, RuntimeValue>;
  private parent: Environment | null;

  constructor(parent: Environment | null = null) {
    this.bindings = new Map();
    this.parent = parent;
  }

  set(name: string, value: RuntimeValue): void {
    this.bindings.set(name, value);
  }

  get(name: string): RuntimeValue | undefined {
    const value = this.bindings.get(name);
    if (value !== undefined) {
      return value;
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    return undefined;
  }

  has(name: string): boolean {
    return this.bindings.has(name) || (this.parent?.has(name) ?? false);
  }
}

// ============================================================================
// Parser Token Types
// ============================================================================

export type Token =
  | { type: 'lparen'; value: '(' }
  | { type: 'rparen'; value: ')' }
  | { type: 'lbracket'; value: '[' }
  | { type: 'rbracket'; value: ']' }
  | { type: 'lbrace'; value: '{' }
  | { type: 'rbrace'; value: '}' }
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'keyword'; value: string }
  | { type: 'symbol'; value: string }
  | { type: 'eof' };

// ============================================================================
// Evaluation Result Types
// ============================================================================

export interface EvalResult {
  success: boolean;
  value?: RuntimeValue;
  error?: string;
  output?: string[];
}

// ============================================================================
// Music Theory Types
// ============================================================================

export type NoteName = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export const NOTE_TO_MIDI: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// Common chord patterns
export const CHORD_PATTERNS: Record<string, number[]> = {
  'maj': [0, 4, 7],
  'min': [0, 3, 7],
  'maj7': [0, 4, 7, 11],
  'min7': [0, 3, 7, 10],
  'dom7': [0, 4, 7, 10],
  'dim': [0, 3, 6],
  'aug': [0, 4, 8],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
};

// Common scale patterns
export const SCALE_PATTERNS: Record<string, number[]> = {
  'major': [0, 2, 4, 5, 7, 9, 11],
  'minor': [0, 2, 3, 5, 7, 8, 10],
  'pentatonic': [0, 2, 4, 7, 9],
  'blues': [0, 3, 5, 6, 7, 10],
  'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

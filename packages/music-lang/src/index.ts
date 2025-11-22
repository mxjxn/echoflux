/**
 * EchoFlux Music Language
 * A Lisp-inspired language for live coding music
 * Inspired by Overtone, Sonic Pi, and SuperCollider
 */

export { MusicLangRuntime } from './runtime/runtime';
export { parse } from './parser/parser';
export { Lexer } from './parser/lexer';
export { Parser } from './parser/parser';
export { Interpreter } from './interpreter/interpreter';

export * from './types';

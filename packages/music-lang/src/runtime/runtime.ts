/**
 * Runtime for the EchoFlux music language
 * Provides the main API for executing music code
 */

import { parse } from '../parser/parser';
import { Interpreter } from '../interpreter/interpreter';
import { setupMusicStdlib } from '../stdlib/music';
import { MusicEngine } from '@echoflux/music-engine';
import { EvalResult, RuntimeValue } from '../types';

export class MusicLangRuntime {
  private interpreter: Interpreter;
  private musicEngine: MusicEngine;

  constructor(musicEngine: MusicEngine) {
    this.musicEngine = musicEngine;
    this.interpreter = new Interpreter(musicEngine);

    // Setup music-specific standard library
    setupMusicStdlib(this.interpreter.getGlobalEnv(), musicEngine);
  }

  /**
   * Evaluate a string of music language code
   */
  public eval(code: string): EvalResult {
    try {
      this.interpreter.clearOutput();

      // Parse the code into AST
      const ast = parse(code);

      if (ast.length === 0) {
        return {
          success: true,
          value: { type: 'nil' },
          output: [],
        };
      }

      // Evaluate each form
      let lastValue: RuntimeValue = { type: 'nil' };
      for (const node of ast) {
        lastValue = this.interpreter.eval(node);
      }

      return {
        success: true,
        value: lastValue,
        output: this.interpreter.getOutput(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        output: this.interpreter.getOutput(),
      };
    }
  }

  /**
   * Evaluate multiple lines of code (REPL-style)
   */
  public evalMulti(lines: string[]): EvalResult[] {
    return lines.map(line => this.eval(line));
  }

  /**
   * Get the music engine instance
   */
  public getEngine(): MusicEngine {
    return this.musicEngine;
  }

  /**
   * Get the interpreter instance
   */
  public getInterpreter(): Interpreter {
    return this.interpreter;
  }

  /**
   * Check if code is syntactically valid
   */
  public validate(code: string): { valid: boolean; error?: string } {
    try {
      parse(code);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Format a runtime value as a string
   */
  public formatValue(value: RuntimeValue): string {
    return this.valueToString(value);
  }

  private valueToString(value: RuntimeValue): string {
    switch (value.type) {
      case 'number':
        return String(value.value);
      case 'string':
        return `"${value.value}"`;
      case 'keyword':
        return `:${value.value}`;
      case 'boolean':
        return value.value ? 'true' : 'false';
      case 'nil':
        return 'nil';
      case 'function':
        return `<function ${value.name || 'anonymous'}>`;
      case 'list':
        return `(${value.elements.map(e => this.valueToString(e)).join(' ')})`;
      case 'vector':
        return `[${value.elements.map(e => this.valueToString(e)).join(' ')}]`;
      case 'map':
        const pairs = Array.from(value.pairs.entries())
          .map(([k, v]) => `${k} ${this.valueToString(v)}`)
          .join(', ');
        return `{${pairs}}`;
      case 'synth-node':
        return `<synth-node ${value.synthName} #${value.id}>`;
      default:
        return '<unknown>';
    }
  }
}

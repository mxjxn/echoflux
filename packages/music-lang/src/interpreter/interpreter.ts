/**
 * Interpreter for the EchoFlux music language
 * Evaluates AST nodes and executes the program
 */

import {
  ASTNode,
  RuntimeValue,
  Environment,
  FunctionValue,
  ListNode,
  VectorNode,
  MapNode,
} from '../types';
import { MusicEngine } from '@echoflux/music-engine';

export class Interpreter {
  private globalEnv: Environment;
  private musicEngine: MusicEngine;
  private output: string[] = [];

  constructor(musicEngine: MusicEngine) {
    this.globalEnv = new Environment();
    this.musicEngine = musicEngine;
    this.setupStdlib();
  }

  /**
   * Setup standard library functions
   */
  private setupStdlib(): void {
    // Arithmetic operators
    this.defineNative('+', (...args: RuntimeValue[]) => {
      const sum = args.reduce((acc, val) => {
        if (val.type !== 'number') throw new Error('+ requires numbers');
        return acc + val.value;
      }, 0);
      return { type: 'number', value: sum };
    });

    this.defineNative('-', (...args: RuntimeValue[]) => {
      if (args.length === 0) throw new Error('- requires at least one argument');
      if (args[0].type !== 'number') throw new Error('- requires numbers');

      if (args.length === 1) {
        return { type: 'number', value: -args[0].value };
      }

      const result = args.slice(1).reduce((acc, val) => {
        if (val.type !== 'number') throw new Error('- requires numbers');
        return acc - val.value;
      }, args[0].value);

      return { type: 'number', value: result };
    });

    this.defineNative('*', (...args: RuntimeValue[]) => {
      const product = args.reduce((acc, val) => {
        if (val.type !== 'number') throw new Error('* requires numbers');
        return acc * val.value;
      }, 1);
      return { type: 'number', value: product };
    });

    this.defineNative('/', (...args: RuntimeValue[]) => {
      if (args.length === 0) throw new Error('/ requires at least one argument');
      if (args[0].type !== 'number') throw new Error('/ requires numbers');

      const result = args.slice(1).reduce((acc, val) => {
        if (val.type !== 'number') throw new Error('/ requires numbers');
        if (val.value === 0) throw new Error('Division by zero');
        return acc / val.value;
      }, args[0].value);

      return { type: 'number', value: result };
    });

    // Comparison operators
    this.defineNative('=', (a: RuntimeValue, b: RuntimeValue) => {
      return { type: 'boolean', value: this.isEqual(a, b) };
    });

    this.defineNative('<', (a: RuntimeValue, b: RuntimeValue) => {
      if (a.type !== 'number' || b.type !== 'number') {
        throw new Error('< requires numbers');
      }
      return { type: 'boolean', value: a.value < b.value };
    });

    this.defineNative('>', (a: RuntimeValue, b: RuntimeValue) => {
      if (a.type !== 'number' || b.type !== 'number') {
        throw new Error('> requires numbers');
      }
      return { type: 'boolean', value: a.value > b.value };
    });

    // Print function
    this.defineNative('print', (...args: RuntimeValue[]) => {
      const output = args.map(arg => this.valueToString(arg)).join(' ');
      this.output.push(output);
      console.log(output);
      return { type: 'nil' };
    });

    // List operations
    this.defineNative('list', (...args: RuntimeValue[]) => {
      return { type: 'list', elements: args };
    });

    this.defineNative('first', (list: RuntimeValue) => {
      if (list.type !== 'list' && list.type !== 'vector') {
        throw new Error('first requires a list or vector');
      }
      return list.elements[0] || { type: 'nil' };
    });

    this.defineNative('rest', (list: RuntimeValue) => {
      if (list.type !== 'list' && list.type !== 'vector') {
        throw new Error('rest requires a list or vector');
      }
      return { type: 'list', elements: list.elements.slice(1) };
    });
  }

  /**
   * Define a native (built-in) function
   */
  private defineNative(name: string, fn: (...args: RuntimeValue[]) => RuntimeValue): void {
    const nativeFn: FunctionValue = {
      type: 'function',
      params: [],
      body: { type: 'symbol', value: '__native__' },
      closure: this.globalEnv,
      name,
    };

    // Store the native implementation
    (nativeFn as any).__native__ = fn;

    this.globalEnv.set(name, nativeFn);
  }

  /**
   * Check if two values are equal
   */
  private isEqual(a: RuntimeValue, b: RuntimeValue): boolean {
    if (a.type !== b.type) return false;

    switch (a.type) {
      case 'number':
        return a.value === (b as typeof a).value;
      case 'string':
        return a.value === (b as typeof a).value;
      case 'keyword':
        return a.value === (b as typeof a).value;
      case 'boolean':
        return a.value === (b as typeof a).value;
      case 'nil':
        return true;
      default:
        return false;
    }
  }

  /**
   * Convert a runtime value to a string representation
   */
  private valueToString(value: RuntimeValue): string {
    switch (value.type) {
      case 'number':
        return String(value.value);
      case 'string':
        return value.value;
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
          .join(' ');
        return `{${pairs}}`;
      case 'synth-node':
        return `<synth-node ${value.synthName} #${value.id}>`;
      default:
        return '<unknown>';
    }
  }

  /**
   * Evaluate an AST node
   */
  public eval(node: ASTNode, env: Environment = this.globalEnv): RuntimeValue {
    switch (node.type) {
      case 'number':
        return { type: 'number', value: node.value };

      case 'string':
        return { type: 'string', value: node.value };

      case 'keyword':
        return { type: 'keyword', value: node.value };

      case 'symbol':
        return this.evalSymbol(node.value, env);

      case 'list':
        return this.evalList(node, env);

      case 'vector':
        return this.evalVector(node, env);

      case 'map':
        return this.evalMap(node, env);

      default:
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }

  /**
   * Evaluate a symbol (variable lookup)
   */
  private evalSymbol(name: string, env: Environment): RuntimeValue {
    const value = env.get(name);
    if (value === undefined) {
      throw new Error(`Undefined symbol: ${name}`);
    }
    return value;
  }

  /**
   * Evaluate a list (function call or special form)
   */
  private evalList(node: ListNode, env: Environment): RuntimeValue {
    if (node.elements.length === 0) {
      return { type: 'list', elements: [] };
    }

    const first = node.elements[0];

    // Special forms
    if (first.type === 'symbol') {
      switch (first.value) {
        case 'def':
          return this.evalDef(node.elements.slice(1), env);
        case 'defn':
          return this.evalDefn(node.elements.slice(1), env);
        case 'let':
          return this.evalLet(node.elements.slice(1), env);
        case 'if':
          return this.evalIf(node.elements.slice(1), env);
        case 'do':
          return this.evalDo(node.elements.slice(1), env);
        case 'fn':
          return this.evalFn(node.elements.slice(1), env);
      }
    }

    // Function call
    const fn = this.eval(first, env);
    const args = node.elements.slice(1).map(arg => this.eval(arg, env));

    return this.applyFunction(fn, args, env);
  }

  /**
   * Evaluate a vector
   */
  private evalVector(node: VectorNode, env: Environment): RuntimeValue {
    return {
      type: 'vector',
      elements: node.elements.map(el => this.eval(el, env)),
    };
  }

  /**
   * Evaluate a map
   */
  private evalMap(node: MapNode, env: Environment): RuntimeValue {
    const pairs = new Map<string, RuntimeValue>();

    for (const [keyNode, valueNode] of node.pairs) {
      const key = this.eval(keyNode, env);
      const value = this.eval(valueNode, env);

      let keyStr: string;
      if (key.type === 'keyword') {
        keyStr = `:${key.value}`;
      } else if (key.type === 'string') {
        keyStr = key.value;
      } else {
        throw new Error('Map keys must be keywords or strings');
      }

      pairs.set(keyStr, value);
    }

    return { type: 'map', pairs };
  }

  /**
   * Apply a function to arguments
   */
  private applyFunction(fn: RuntimeValue, args: RuntimeValue[], env: Environment): RuntimeValue {
    if (fn.type !== 'function') {
      throw new Error(`Cannot call non-function: ${this.valueToString(fn)}`);
    }

    // Check if it's a native function
    if ((fn as any).__native__) {
      return (fn as any).__native__(...args);
    }

    // User-defined function
    if (fn.params.length !== args.length) {
      throw new Error(`Function expects ${fn.params.length} arguments, got ${args.length}`);
    }

    // Create new environment with function parameters
    const fnEnv = new Environment(fn.closure);
    for (let i = 0; i < fn.params.length; i++) {
      fnEnv.set(fn.params[i], args[i]);
    }

    return this.eval(fn.body, fnEnv);
  }

  /**
   * (def name value)
   */
  private evalDef(args: ASTNode[], env: Environment): RuntimeValue {
    if (args.length !== 2) {
      throw new Error('def requires exactly 2 arguments');
    }

    if (args[0].type !== 'symbol') {
      throw new Error('def requires a symbol as first argument');
    }

    const name = args[0].value;
    const value = this.eval(args[1], env);

    env.set(name, value);
    return value;
  }

  /**
   * (defn name [params] body)
   */
  private evalDefn(args: ASTNode[], env: Environment): RuntimeValue {
    if (args.length !== 3) {
      throw new Error('defn requires exactly 3 arguments');
    }

    if (args[0].type !== 'symbol') {
      throw new Error('defn requires a symbol as first argument');
    }

    if (args[1].type !== 'vector') {
      throw new Error('defn requires a vector of parameters');
    }

    const name = args[0].value;
    const params = args[1].elements.map(p => {
      if (p.type !== 'symbol') {
        throw new Error('Function parameters must be symbols');
      }
      return p.value;
    });

    const fn: FunctionValue = {
      type: 'function',
      params,
      body: args[2],
      closure: env,
      name,
    };

    env.set(name, fn);
    return fn;
  }

  /**
   * (let [bindings] body)
   */
  private evalLet(args: ASTNode[], env: Environment): RuntimeValue {
    if (args.length !== 2) {
      throw new Error('let requires exactly 2 arguments');
    }

    if (args[0].type !== 'vector') {
      throw new Error('let requires a vector of bindings');
    }

    const bindings = args[0].elements;
    if (bindings.length % 2 !== 0) {
      throw new Error('let bindings must be an even number of forms');
    }

    const letEnv = new Environment(env);

    for (let i = 0; i < bindings.length; i += 2) {
      const binding = bindings[i];
      if (binding.type !== 'symbol') {
        throw new Error('let binding names must be symbols');
      }

      const name = binding.value;
      const value = this.eval(bindings[i + 1], letEnv);
      letEnv.set(name, value);
    }

    return this.eval(args[1], letEnv);
  }

  /**
   * (if condition then else)
   */
  private evalIf(args: ASTNode[], env: Environment): RuntimeValue {
    if (args.length < 2 || args.length > 3) {
      throw new Error('if requires 2 or 3 arguments');
    }

    const condition = this.eval(args[0], env);
    const isTruthy = this.isTruthy(condition);

    if (isTruthy) {
      return this.eval(args[1], env);
    } else if (args.length === 3) {
      return this.eval(args[2], env);
    } else {
      return { type: 'nil' };
    }
  }

  /**
   * (do expr1 expr2 ...)
   */
  private evalDo(args: ASTNode[], env: Environment): RuntimeValue {
    let result: RuntimeValue = { type: 'nil' };

    for (const expr of args) {
      result = this.eval(expr, env);
    }

    return result;
  }

  /**
   * (fn [params] body)
   */
  private evalFn(args: ASTNode[], env: Environment): RuntimeValue {
    if (args.length !== 2) {
      throw new Error('fn requires exactly 2 arguments');
    }

    if (args[0].type !== 'vector') {
      throw new Error('fn requires a vector of parameters');
    }

    const params = args[0].elements.map(p => {
      if (p.type !== 'symbol') {
        throw new Error('Function parameters must be symbols');
      }
      return p.value;
    });

    return {
      type: 'function',
      params,
      body: args[1],
      closure: env,
    };
  }

  /**
   * Check if a value is truthy
   */
  private isTruthy(value: RuntimeValue): boolean {
    if (value.type === 'nil') return false;
    if (value.type === 'boolean') return value.value;
    return true;
  }

  /**
   * Get accumulated output
   */
  public getOutput(): string[] {
    return [...this.output];
  }

  /**
   * Clear output
   */
  public clearOutput(): void {
    this.output = [];
  }

  /**
   * Get the global environment
   */
  public getGlobalEnv(): Environment {
    return this.globalEnv;
  }
}

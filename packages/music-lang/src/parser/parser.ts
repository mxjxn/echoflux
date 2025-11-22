/**
 * Parser for the EchoFlux music language
 * Converts tokens into an Abstract Syntax Tree (AST)
 */

import { Token, ASTNode, ListNode, VectorNode, MapNode } from '../types';
import { Lexer } from './lexer';

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private current(): Token {
    return this.tokens[this.pos];
  }

  private advance(): void {
    this.pos++;
  }

  private expect(type: Token['type']): void {
    if (this.current().type !== type) {
      throw new Error(`Expected ${type}, got ${this.current().type}`);
    }
    this.advance();
  }

  /**
   * Parse a single form (S-expression)
   */
  private parseForm(): ASTNode {
    const token = this.current();

    switch (token.type) {
      case 'number':
        this.advance();
        return { type: 'number', value: token.value };

      case 'string':
        this.advance();
        return { type: 'string', value: token.value };

      case 'keyword':
        this.advance();
        return { type: 'keyword', value: token.value };

      case 'symbol':
        this.advance();
        return { type: 'symbol', value: token.value };

      case 'lparen':
        return this.parseList();

      case 'lbracket':
        return this.parseVector();

      case 'lbrace':
        return this.parseMap();

      case 'eof':
        throw new Error('Unexpected end of input');

      default:
        throw new Error(`Unexpected token type: ${token.type}`);
    }
  }

  /**
   * Parse a list: (...)
   */
  private parseList(): ListNode {
    this.expect('lparen');
    const elements: ASTNode[] = [];

    while (this.current().type !== 'rparen' && this.current().type !== 'eof') {
      elements.push(this.parseForm());
    }

    this.expect('rparen');
    return { type: 'list', elements };
  }

  /**
   * Parse a vector: [...]
   */
  private parseVector(): VectorNode {
    this.expect('lbracket');
    const elements: ASTNode[] = [];

    while (this.current().type !== 'rbracket' && this.current().type !== 'eof') {
      elements.push(this.parseForm());
    }

    this.expect('rbracket');
    return { type: 'vector', elements };
  }

  /**
   * Parse a map: {...}
   */
  private parseMap(): MapNode {
    this.expect('lbrace');
    const pairs: [ASTNode, ASTNode][] = [];

    while (this.current().type !== 'rbrace' && this.current().type !== 'eof') {
      if (this.current().type === 'eof') {
        throw new Error('Unexpected end of input in map');
      }

      const key = this.parseForm();

      if (this.current().type === 'rbrace' || this.current().type === 'eof') {
        throw new Error('Map literal must have an even number of forms');
      }

      const value = this.parseForm();
      pairs.push([key, value]);
    }

    this.expect('rbrace');
    return { type: 'map', pairs };
  }

  /**
   * Parse all forms in the source code
   */
  public parseAll(): ASTNode[] {
    const forms: ASTNode[] = [];

    while (this.current().type !== 'eof') {
      forms.push(this.parseForm());
    }

    return forms;
  }
}

/**
 * Convenience function to parse source code directly
 */
export function parse(source: string): ASTNode[] {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parseAll();
}

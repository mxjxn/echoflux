/**
 * Lexer/Tokenizer for the EchoFlux music language
 * Converts source code into tokens
 */

import { Token } from '../types';

export class Lexer {
  private source: string;
  private pos: number = 0;
  private current: string | null;

  constructor(source: string) {
    this.source = source;
    this.current = source.length > 0 ? source[0] : null;
  }

  private advance(): void {
    this.pos++;
    this.current = this.pos < this.source.length ? this.source[this.pos] : null;
  }

  private peek(offset: number = 1): string | null {
    const peekPos = this.pos + offset;
    return peekPos < this.source.length ? this.source[peekPos] : null;
  }

  private skipWhitespace(): void {
    while (this.current && /\s/.test(this.current)) {
      this.advance();
    }
  }

  private skipComment(): void {
    if (this.current !== ';') return;

    // Skip until end of line (including the semicolon)
    while (true) {
      this.advance();
      const curr: string | null = this.current;
      if (curr === null || curr === '\n') break;
    }

    // Skip the newline if present
    if (this.current !== null) {
      this.advance();
    }
  }

  private readNumber(): Token {
    let numStr = '';
    let hasDecimal = false;

    while (this.current && (/\d/.test(this.current) || this.current === '.')) {
      if (this.current === '.') {
        if (hasDecimal) break; // Second decimal point, stop
        hasDecimal = true;
      }
      numStr += this.current;
      this.advance();
    }

    return { type: 'number', value: parseFloat(numStr) };
  }

  private readString(): Token {
    let str = '';
    this.advance(); // Skip opening quote

    while (this.current && this.current !== '"') {
      if (this.current === '\\' && this.peek() === '"') {
        // Escaped quote
        this.advance();
        str += '"';
        this.advance();
      } else if (this.current === '\\' && this.peek() === 'n') {
        // Newline
        this.advance();
        str += '\n';
        this.advance();
      } else {
        str += this.current;
        this.advance();
      }
    }

    this.advance(); // Skip closing quote
    return { type: 'string', value: str };
  }

  private readKeywordOrSymbol(): Token {
    let text = '';

    // Check if it starts with a keyword marker
    const isKeyword = this.current === ':';
    if (isKeyword) {
      this.advance(); // Skip the ':'
    }

    // Read the identifier
    while (
      this.current &&
      /[a-zA-Z0-9_\-+*/<>=!?]/.test(this.current)
    ) {
      text += this.current;
      this.advance();
    }

    if (isKeyword) {
      return { type: 'keyword', value: text };
    }

    return { type: 'symbol', value: text };
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.current !== null) {
      this.skipWhitespace();

      if (this.current === null) break;

      // Comments
      if (this.current === ';') {
        this.skipComment();
        continue;
      }

      // Parentheses
      if (this.current === '(') {
        tokens.push({ type: 'lparen', value: '(' });
        this.advance();
        continue;
      }

      if (this.current === ')') {
        tokens.push({ type: 'rparen', value: ')' });
        this.advance();
        continue;
      }

      // Brackets
      if (this.current === '[') {
        tokens.push({ type: 'lbracket', value: '[' });
        this.advance();
        continue;
      }

      if (this.current === ']') {
        tokens.push({ type: 'rbracket', value: ']' });
        this.advance();
        continue;
      }

      // Braces
      if (this.current === '{') {
        tokens.push({ type: 'lbrace', value: '{' });
        this.advance();
        continue;
      }

      if (this.current === '}') {
        tokens.push({ type: 'rbrace', value: '}' });
        this.advance();
        continue;
      }

      // Numbers
      if (/\d/.test(this.current) || (this.current === '-' && this.peek() && /\d/.test(this.peek()!))) {
        const isNegative = this.current === '-';
        if (isNegative) {
          this.advance();
        }
        const token = this.readNumber();
        if (isNegative && token.type === 'number') {
          token.value = -token.value;
        }
        tokens.push(token);
        continue;
      }

      // Strings
      if (this.current === '"') {
        tokens.push(this.readString());
        continue;
      }

      // Keywords and Symbols
      if (this.current === ':' || /[a-zA-Z_+\-*/<>=!?]/.test(this.current)) {
        tokens.push(this.readKeywordOrSymbol());
        continue;
      }

      // Unknown character
      throw new Error(`Unexpected character: ${this.current}`);
    }

    tokens.push({ type: 'eof' });
    return tokens;
  }
}

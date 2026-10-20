/**
 * LOGICLAB - Propositional Logic Parser & AST Engine
 * Course: 7MA206 Discrete Mathematics (Unit I: Logic & Proof Techniques)
 * 
 * Supports:
 * - Operators: ¬ (NOT), ∧ (AND), ∨ (OR), → (IMPLIES), ↔ (BICONDITIONAL / IFF), ⊕ (XOR)
 * - Text aliases: NOT, AND, OR, ->, <->, IMPLIES, IFF, XOR, ~, !, &, |, ^
 * - Arbitrary propositions (P, Q, R, S, A, B, etc.) and constants (T, F, 1, 0, TRUE, FALSE)
 * - Operator Precedence: ( ) > ¬ > ∧ > ∨ / ⊕ > → > ↔
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.LogicParser = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Operator Tokens
    const TokenType = {
        VAR: 'VAR',
        CONST: 'CONST',
        NOT: 'NOT',
        AND: 'AND',
        OR: 'OR',
        XOR: 'XOR',
        IMPLIES: 'IMPLIES',
        IFF: 'IFF',
        LPAREN: 'LPAREN',
        RPAREN: 'RPAREN',
        EOF: 'EOF'
    };

    // Standard Mathematical Symbols
    const Symbols = {
        NOT: '¬',
        AND: '∧',
        OR: '∨',
        XOR: '⊕',
        IMPLIES: '→',
        IFF: '↔',
        TRUE: 'T',
        FALSE: 'F'
    };

    // Precedence table (Higher number = tighter binding)
    const Precedence = {
        [TokenType.IFF]: 1,      // ↔ (lowest)
        [TokenType.IMPLIES]: 2,  // → (right-associative)
        [TokenType.OR]: 3,       // ∨
        [TokenType.XOR]: 3,      // ⊕
        [TokenType.AND]: 4,      // ∧
        [TokenType.NOT]: 5       // ¬ (unary, highest after parens)
    };

    /**
     * Lexical Token
     */
    class Token {
        constructor(type, value, start, end) {
            this.type = type;
            this.value = value;
            this.start = start;
            this.end = end;
        }
    }

    /**
     * Tokenizer / Lexer
     */
    class Lexer {
        constructor(input) {
            this.input = input.trim();
            this.pos = 0;
            this.length = this.input.length;
        }

        peek() {
            return this.pos < this.length ? this.input[this.pos] : null;
        }

        next() {
            return this.pos < this.length ? this.input[this.pos++] : null;
        }

        skipWhitespace() {
            while (this.pos < this.length && /\s/.test(this.input[this.pos])) {
                this.pos++;
            }
        }

        tokenize() {
            const tokens = [];

            while (this.pos < this.length) {
                this.skipWhitespace();
                if (this.pos >= this.length) break;

                const start = this.pos;
                const char = this.peek();

                // Multi-character arrows & symbols
                if (this.input.startsWith('<->', this.pos) || this.input.startsWith('<=>', this.pos)) {
                    this.pos += 3;
                    tokens.push(new Token(TokenType.IFF, Symbols.IFF, start, this.pos));
                    continue;
                }
                if (this.input.startsWith('->', this.pos) || this.input.startsWith('=>', this.pos)) {
                    this.pos += 2;
                    tokens.push(new Token(TokenType.IMPLIES, Symbols.IMPLIES, start, this.pos));
                    continue;
                }

                // Single character unicode or ascii logic symbols
                if (char === '↔') {
                    this.next();
                    tokens.push(new Token(TokenType.IFF, Symbols.IFF, start, this.pos));
                    continue;
                }
                if (char === '→') {
                    this.next();
                    tokens.push(new Token(TokenType.IMPLIES, Symbols.IMPLIES, start, this.pos));
                    continue;
                }
                if (char === '∧' || char === '&' || char === '*') {
                    this.next();
                    tokens.push(new Token(TokenType.AND, Symbols.AND, start, this.pos));
                    continue;
                }
                if (char === '∨' || char === '|') {
                    this.next();
                    tokens.push(new Token(TokenType.OR, Symbols.OR, start, this.pos));
                    continue;
                }
                if (char === '¬' || char === '~' || char === '!') {
                    this.next();
                    tokens.push(new Token(TokenType.NOT, Symbols.NOT, start, this.pos));
                    continue;
                }
                if (char === '⊕' || char === '^') {
                    this.next();
                    tokens.push(new Token(TokenType.XOR, Symbols.XOR, start, this.pos));
                    continue;
                }
                if (char === '(') {
                    this.next();
                    tokens.push(new Token(TokenType.LPAREN, '(', start, this.pos));
                    continue;
                }
                if (char === ')') {
                    this.next();
                    tokens.push(new Token(TokenType.RPAREN, ')', start, this.pos));
                    continue;
                }

                // Words: text operators (AND, OR, NOT, IMPLIES, IFF, XOR) or Constants or Variables
                if (/[a-zA-Z0-9_]/.test(char)) {
                    let word = '';
                    while (this.pos < this.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
                        word += this.next();
                    }

                    const upper = word.toUpperCase();

                    if (upper === 'NOT') {
                        tokens.push(new Token(TokenType.NOT, Symbols.NOT, start, this.pos));
                    } else if (upper === 'AND') {
                        tokens.push(new Token(TokenType.AND, Symbols.AND, start, this.pos));
                    } else if (upper === 'OR') {
                        tokens.push(new Token(TokenType.OR, Symbols.OR, start, this.pos));
                    } else if (upper === 'IMPLIES' || upper === 'THEN') {
                        tokens.push(new Token(TokenType.IMPLIES, Symbols.IMPLIES, start, this.pos));
                    } else if (upper === 'IFF' || upper === 'EQUIV') {
                        tokens.push(new Token(TokenType.IFF, Symbols.IFF, start, this.pos));
                    } else if (upper === 'XOR') {
                        tokens.push(new Token(TokenType.XOR, Symbols.XOR, start, this.pos));
                    } else if (upper === 'TRUE' || upper === 'T' || (word === '1' && !/[a-zA-Z]/.test(this.peek() || ''))) {
                        // Check if single 'T' is variable or constant
                        // Convention: If uppercase TRUE or 1 -> constant. Single T can be constant or proposition.
                        // In discrete math, P, Q, R, S, A, B, C are standard vars. 'T' is often True.
                        if (upper === 'TRUE' || word === '1') {
                            tokens.push(new Token(TokenType.CONST, true, start, this.pos));
                        } else {
                            // Treat single letter T as variable unless explicitly TRUE
                            tokens.push(new Token(TokenType.VAR, upper, start, this.pos));
                        }
                    } else if (upper === 'FALSE' || upper === 'F' || (word === '0' && !/[a-zA-Z]/.test(this.peek() || ''))) {
                        if (upper === 'FALSE' || word === '0') {
                            tokens.push(new Token(TokenType.CONST, false, start, this.pos));
                        } else {
                            tokens.push(new Token(TokenType.VAR, upper, start, this.pos));
                        }
                    } else if (upper === 'V' && tokens.length > 0 && 
                              (tokens[tokens.length - 1].type === TokenType.VAR || tokens[tokens.length - 1].type === TokenType.RPAREN) &&
                              this.pos < this.length && /[a-zA-Z(¬~!]/.test(this.input[this.pos] || '')) {
                        // Special check: someone typing 'P v Q' with letter 'v' as OR
                        tokens.push(new Token(TokenType.OR, Symbols.OR, start, this.pos));
                    } else {
                        // Propositional variable (e.g. P, Q, R, P1, Q2, A, B)
                        tokens.push(new Token(TokenType.VAR, upper, start, this.pos));
                    }
                    continue;
                }

                throw new Error(`Unrecognized symbol '${char}' at character position ${start + 1}.`);
            }

            tokens.push(new Token(TokenType.EOF, 'EOF', this.pos, this.pos));
            return tokens;
        }
    }

    /**
     * AST Node Classes
     */
    class ASTNode {
        evaluate(assignment) {
            throw new Error('evaluate() must be implemented in subclass');
        }

        getVariables(set = new Set()) {
            return set;
        }

        toString() {
            throw new Error('toString() must be implemented');
        }

        toFormattedString() {
            return this.toString();
        }

        collectSubexpressions(result = [], seen = new Set()) {
            // Collect post-order subexpressions
            return result;
        }
    }

    class VariableNode extends ASTNode {
        constructor(name) {
            super();
            this.type = 'VARIABLE';
            this.name = name;
        }

        evaluate(assignment) {
            if (assignment[this.name] === undefined) {
                throw new Error(`Variable '${this.name}' has no assigned truth value.`);
            }
            return Boolean(assignment[this.name]);
        }

        getVariables(set = new Set()) {
            set.add(this.name);
            return set;
        }

        toString() {
            return this.name;
        }

        collectSubexpressions(result = [], seen = new Set()) {
            // Variables are usually listed as header columns, but can be collected
            return result;
        }
    }

    class ConstantNode extends ASTNode {
        constructor(value) {
            super();
            this.type = 'CONSTANT';
            this.value = Boolean(value);
        }

        evaluate() {
            return this.value;
        }

        toString() {
            return this.value ? 'T' : 'F';
        }
    }

    class UnaryOpNode extends ASTNode {
        constructor(op, operand) {
            super();
            this.type = 'UNARY_OP';
            this.op = op; // 'NOT' or '¬'
            this.operand = operand;
        }

        evaluate(assignment) {
            return !this.operand.evaluate(assignment);
        }

        getVariables(set = new Set()) {
            return this.operand.getVariables(set);
        }

        toString() {
            const inner = this.operand.toString();
            if (this.operand.type === 'BINARY_OP') {
                return `${Symbols.NOT}(${inner})`;
            }
            return `${Symbols.NOT}${inner}`;
        }

        collectSubexpressions(result = [], seen = new Set()) {
            this.operand.collectSubexpressions(result, seen);
            const str = this.toString();
            if (!seen.has(str)) {
                seen.add(str);
                result.push({
                    node: this,
                    str: str
                });
            }
            return result;
        }
    }

    class BinaryOpNode extends ASTNode {
        constructor(op, left, right) {
            super();
            this.type = 'BINARY_OP';
            this.op = op; // TokenType.AND, TokenType.OR, TokenType.IMPLIES, etc.
            this.left = left;
            this.right = right;
        }

        evaluate(assignment) {
            const lVal = this.left.evaluate(assignment);
            const rVal = this.right.evaluate(assignment);

            switch (this.op) {
                case TokenType.AND:
                    return lVal && rVal;
                case TokenType.OR:
                    return lVal || rVal;
                case TokenType.XOR:
                    return lVal !== rVal;
                case TokenType.IMPLIES:
                    // P → Q is equivalent to ¬P ∨ Q
                    return !lVal || rVal;
                case TokenType.IFF:
                    // P ↔ Q is true if both have same truth value
                    return lVal === rVal;
                default:
                    throw new Error(`Unknown operator '${this.op}'`);
            }
        }

        getVariables(set = new Set()) {
            this.left.getVariables(set);
            this.right.getVariables(set);
            return set;
        }

        getOpSymbol() {
            switch (this.op) {
                case TokenType.AND: return Symbols.AND;
                case TokenType.OR: return Symbols.OR;
                case TokenType.XOR: return Symbols.XOR;
                case TokenType.IMPLIES: return Symbols.IMPLIES;
                case TokenType.IFF: return Symbols.IFF;
                default: return this.op;
            }
        }

        toString() {
            const sym = this.getOpSymbol();
            const leftStr = this.left.toString();
            const rightStr = this.right.toString();

            const leftNeedsParen = this.left.type === 'BINARY_OP' &&
                (Precedence[this.left.op] < Precedence[this.op] ||
                 (Precedence[this.left.op] === Precedence[this.op] && this.op === TokenType.IMPLIES));
            
            const rightNeedsParen = this.right.type === 'BINARY_OP' &&
                (Precedence[this.right.op] <= Precedence[this.op]);

            const l = leftNeedsParen ? `(${leftStr})` : leftStr;
            const r = rightNeedsParen ? `(${rightStr})` : rightStr;

            return `${l} ${sym} ${r}`;
        }

        collectSubexpressions(result = [], seen = new Set()) {
            this.left.collectSubexpressions(result, seen);
            this.right.collectSubexpressions(result, seen);
            const str = this.toString();
            if (!seen.has(str)) {
                seen.add(str);
                result.push({
                    node: this,
                    str: str
                });
            }
            return result;
        }
    }

    /**
     * Parser
     */
    class Parser {
        constructor(tokens) {
            this.tokens = tokens;
            this.pos = 0;
        }

        peek() {
            return this.tokens[this.pos];
        }

        previous() {
            return this.tokens[this.pos - 1];
        }

        isAtEnd() {
            return this.peek().type === TokenType.EOF;
        }

        advance() {
            if (!this.isAtEnd()) this.pos++;
            return this.previous();
        }

        check(type) {
            if (this.isAtEnd()) return false;
            return this.peek().type === type;
        }

        match(...types) {
            for (const type of types) {
                if (this.check(type)) {
                    this.advance();
                    return true;
                }
            }
            return false;
        }

        consume(type, errorMessage) {
            if (this.check(type)) return this.advance();
            const current = this.peek();
            throw new Error(`${errorMessage} (found '${current.value}' at position ${current.start + 1})`);
        }

        parse() {
            if (this.tokens.length === 0 || this.peek().type === TokenType.EOF) {
                throw new Error('Expression is empty. Please enter a valid propositional formula.');
            }
            const expr = this.parseEquivalence();
            if (!this.isAtEnd()) {
                const extra = this.peek();
                throw new Error(`Unexpected token '${extra.value}' at position ${extra.start + 1}. Check for missing operators.`);
            }
            return expr;
        }

        // Biconditional: P ↔ Q
        parseEquivalence() {
            let expr = this.parseImplication();

            while (this.match(TokenType.IFF)) {
                const op = this.previous().type;
                const right = this.parseImplication();
                expr = new BinaryOpNode(op, expr, right);
            }

            return expr;
        }

        // Implication: P → Q (Right-associative in standard logic: P → Q → R is P → (Q → R))
        parseImplication() {
            let expr = this.parseDisjunction();

            if (this.match(TokenType.IMPLIES)) {
                const op = this.previous().type;
                const right = this.parseImplication(); // Right-associative recursion!
                return new BinaryOpNode(op, expr, right);
            }

            return expr;
        }

        // Disjunction: P ∨ Q or P ⊕ Q
        parseDisjunction() {
            let expr = this.parseConjunction();

            while (this.match(TokenType.OR, TokenType.XOR)) {
                const op = this.previous().type;
                const right = this.parseConjunction();
                expr = new BinaryOpNode(op, expr, right);
            }

            return expr;
        }

        // Conjunction: P ∧ Q
        parseConjunction() {
            let expr = this.parseUnary();

            while (this.match(TokenType.AND)) {
                const op = this.previous().type;
                const right = this.parseUnary();
                expr = new BinaryOpNode(op, expr, right);
            }

            return expr;
        }

        // Unary: ¬P
        parseUnary() {
            if (this.match(TokenType.NOT)) {
                const op = this.previous().type;
                const operand = this.parseUnary(); // allows ¬¬P
                return new UnaryOpNode(op, operand);
            }

            return this.parsePrimary();
        }

        // Primary: Variable, Constant, (Expression)
        parsePrimary() {
            if (this.match(TokenType.CONST)) {
                return new ConstantNode(this.previous().value);
            }

            if (this.match(TokenType.VAR)) {
                return new VariableNode(this.previous().value);
            }

            if (this.match(TokenType.LPAREN)) {
                const openPos = this.previous().start;
                const expr = this.parseEquivalence();
                if (!this.check(TokenType.RPAREN)) {
                    throw new Error(`Missing closing parenthesis ')' for '(' opened at position ${openPos + 1}.`);
                }
                this.consume(TokenType.RPAREN, "Expected ')' after subexpression");
                return expr;
            }

            const current = this.peek();
            if (current.type === TokenType.EOF) {
                throw new Error("Unexpected end of expression. Expected a proposition variable (like P, Q, R) or subexpression.");
            }
            if (current.type === TokenType.RPAREN) {
                throw new Error(`Unexpected closing parenthesis ')' at position ${current.start + 1} with no matching opening parenthesis.`);
            }
            throw new Error(`Expected proposition variable or expression at position ${current.start + 1}, but encountered '${current.value}'.`);
        }
    }

    /**
     * Public API Helper
     */
    function parse(inputString) {
        if (!inputString || typeof inputString !== 'string' || !inputString.trim()) {
            throw new Error('Please enter a logic expression.');
        }
        const lexer = new Lexer(inputString);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        return ast;
    }

    /**
     * Normalizes an expression string by replacing common text operators with standard symbols
     */
    function normalizeExpressionString(str) {
        if (!str) return '';
        return str
            .replace(/<->|<=>|iff/gi, ' ↔ ')
            .replace(/->|=>|implies/gi, ' → ')
            .replace(/\bnot\b|~/gi, ' ¬ ')
            .replace(/\band\b|&|\*/gi, ' ∧ ')
            .replace(/\bor\b|\|/gi, ' ∨ ')
            .replace(/\bxor\b|\^/gi, ' ⊕ ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    return {
        TokenType,
        Symbols,
        Precedence,
        Lexer,
        Parser,
        parse,
        normalizeExpressionString,
        ASTNodes: {
            VariableNode,
            ConstantNode,
            UnaryOpNode,
            BinaryOpNode
        }
    };
}));

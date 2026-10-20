/**
 * LOGICLAB - Propositional Resolution Solver
 * Course: 7MA206 Discrete Mathematics (Unit I: Logic & Proof Techniques)
 * 
 * Features:
 * - Parses propositional clauses (disjunctions of literals)
 * - Identifies complementary literal pairs (L and ¬L)
 * - Implements Robinson's Propositional Resolution Algorithm
 * - Generates visual step-by-step resolution derivation history
 * - Detects derivation of the empty clause (□ / Contradiction)
 * - Proves satisfiability or refutation completeness
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./parser'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./parser'));
    } else {
        root.LogicResolution = factory(root.LogicParser);
    }
}(typeof self !== 'undefined' ? self : this, function (LogicParser) {
    'use strict';

    /**
     * Literal: represents a proposition variable (positive or negated)
     * e.g. P (positive=true, varName='P')
     *     ¬P (positive=false, varName='P')
     */
    class Literal {
        constructor(varName, isPositive = true) {
            this.varName = varName.toUpperCase().trim();
            this.isPositive = Boolean(isPositive);
        }

        negate() {
            return new Literal(this.varName, !this.isPositive);
        }

        isComplementOf(other) {
            return this.varName === other.varName && this.isPositive !== other.isPositive;
        }

        toString() {
            return this.isPositive ? this.varName : `${LogicParser.Symbols.NOT}${this.varName}`;
        }

        equals(other) {
            return this.varName === other.varName && this.isPositive === other.isPositive;
        }
    }

    /**
     * Clause: a set of literals connected by disjunction (OR)
     */
    class Clause {
        constructor(literals = [], id = null, parents = null, resolvedOn = null) {
            // Deduplicate literals
            this.literals = [];
            for (const lit of literals) {
                if (!this.literals.some(existing => existing.equals(lit))) {
                    this.literals.push(lit);
                }
            }
            // Sort literals alphabetically by variable name
            this.literals.sort((a, b) => a.varName.localeCompare(b.varName));

            this.id = id;
            this.parents = parents; // [clauseId1, clauseId2] if derived
            this.resolvedOn = resolvedOn; // literal that was cancelled
        }

        isEmpty() {
            return this.literals.length === 0;
        }

        isTautology() {
            // e.g. P ∨ ¬P in the same clause
            for (let i = 0; i < this.literals.length; i++) {
                for (let j = i + 1; j < this.literals.length; j++) {
                    if (this.literals[i].isComplementOf(this.literals[j])) {
                        return true;
                    }
                }
            }
            return false;
        }

        toString() {
            if (this.isEmpty()) return '□ (Empty Clause)';
            if (this.literals.length === 1) return this.literals[0].toString();
            return `(${this.literals.map(l => l.toString()).join(` ${LogicParser.Symbols.OR} `)})`;
        }

        equals(other) {
            if (this.literals.length !== other.literals.length) return false;
            for (let i = 0; i < this.literals.length; i++) {
                if (!this.literals[i].equals(other.literals[i])) return false;
            }
            return true;
        }
    }

    /**
     * Parse clause string like "(P ∨ Q)" or "¬P ∨ R" or "P" or "¬Q"
     */
    function parseClauseString(clauseStr, id = null) {
        let cleaned = clauseStr.trim();
        if (!cleaned) throw new Error('Empty clause string provided.');

        // Strip surrounding parentheses if they wrap the entire clause
        if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
            cleaned = cleaned.substring(1, cleaned.length - 1).trim();
        }

        // Replace text ORs
        const rawTokens = cleaned
            .replace(/∨|\||\bor\b|\+/gi, ' ∨ ')
            .split('∨')
            .map(s => s.trim())
            .filter(Boolean);

        if (rawTokens.length === 0) {
            return new Clause([], id);
        }

        const literals = [];
        for (const token of rawTokens) {
            let litStr = token.trim();
            let isPositive = true;

            // Handle negation prefixes ¬, ~, !, not
            while (litStr.startsWith('¬') || litStr.startsWith('~') || litStr.startsWith('!') || litStr.toLowerCase().startsWith('not ')) {
                if (litStr.toLowerCase().startsWith('not ')) {
                    litStr = litStr.substring(4).trim();
                } else {
                    litStr = litStr.substring(1).trim();
                }
                isPositive = !isPositive;
            }

            // Remove any trailing parentheses
            litStr = litStr.replace(/[()]/g, '').trim();

            if (!/^[a-zA-Z0-9_]+$/.test(litStr)) {
                throw new Error(`Invalid literal "${token}" in clause "${clauseStr}".`);
            }

            literals.push(new Literal(litStr, isPositive));
        }

        return new Clause(literals, id);
    }

    /**
     * Resolve two clauses C1 and C2 on complementary literal L
     * Returns array of possible resolvents (usually 1, or empty if no complementary literal)
     */
    function resolvePair(c1, c2, nextId) {
        const resolvents = [];

        for (const lit1 of c1.literals) {
            for (const lit2 of c2.literals) {
                if (lit1.isComplementOf(lit2)) {
                    // Complement found! Combine remaining literals
                    const newLits = [];

                    for (const l of c1.literals) {
                        if (!l.equals(lit1)) newLits.push(l);
                    }
                    for (const l of c2.literals) {
                        if (!l.equals(lit2)) newLits.push(l);
                    }

                    const resolvent = new Clause(
                        newLits,
                        nextId,
                        [c1.id, c2.id],
                        lit1.varName
                    );

                    // Skip tautological resolvents (e.g. Q ∨ ¬Q)
                    if (!resolvent.isTautology()) {
                        resolvents.push({
                            resolvent,
                            resolvedOn: lit1.varName,
                            cancelledLiterals: [lit1.toString(), lit2.toString()]
                        });
                    }
                }
            }
        }

        return resolvents;
    }

    /**
     * Propositional Resolution Algorithm
     * Runs step-by-step resolution derivation until empty clause or saturation
     */
    function solveResolution(rawClauses, maxSteps = 40) {
        const parsedClauses = [];
        let idCounter = 1;

        for (const raw of rawClauses) {
            if (typeof raw === 'string' && !raw.trim()) continue;
            const clause = typeof raw === 'string' ? parseClauseString(raw, `C${idCounter++}`) : raw;
            clause.id = `C${parsedClauses.length + 1}`;
            parsedClauses.push(clause);
        }

        if (parsedClauses.length === 0) {
            throw new Error('Please enter at least one propositional clause.');
        }

        // Check if any initial clause is already empty
        for (const c of parsedClauses) {
            if (c.isEmpty()) {
                return {
                    initialClauses: parsedClauses,
                    derivationSteps: [],
                    emptyClauseDerived: true,
                    emptyClauseId: c.id,
                    verdict: 'Refutation Complete: Empty clause (□) was present initially.',
                    isUnsatisfiable: true
                };
            }
        }

        const clauses = [...parsedClauses];
        const derivationSteps = [];
        let emptyClauseDerived = false;
        let emptyClauseId = null;

        let stepIndex = 1;
        let newClauseAdded = true;

        while (newClauseAdded && !emptyClauseDerived && stepIndex <= maxSteps) {
            newClauseAdded = false;

            const currentCount = clauses.length;

            outerLoop:
            for (let i = 0; i < currentCount; i++) {
                for (let j = i + 1; j < currentCount; j++) {
                    const c1 = clauses[i];
                    const c2 = clauses[j];

                    // Resolve pair
                    const outcomes = resolvePair(c1, c2, `C${clauses.length + 1}`);

                    for (const outcome of outcomes) {
                        const resolvent = outcome.resolvent;

                        // Check if clause already exists in set
                        const alreadyExists = clauses.some(existing => existing.equals(resolvent));

                        if (!alreadyExists) {
                            clauses.push(resolvent);
                            newClauseAdded = true;

                            derivationSteps.push({
                                stepNumber: stepIndex++,
                                clauseId: resolvent.id,
                                parent1: c1.id,
                                parent1Str: c1.toString(),
                                parent2: c2.id,
                                parent2Str: c2.toString(),
                                resolvedOn: outcome.resolvedOn,
                                cancelled: outcome.cancelledLiterals.join(' and '),
                                resolventStr: resolvent.toString(),
                                isEmpty: resolvent.isEmpty()
                            });

                            if (resolvent.isEmpty()) {
                                emptyClauseDerived = true;
                                emptyClauseId = resolvent.id;
                                break outerLoop;
                            }

                            if (stepIndex > maxSteps) break outerLoop;
                        }
                    }
                }
            }
        }

        const isUnsatisfiable = emptyClauseDerived;
        const verdict = emptyClauseDerived
            ? `CONTRADICTION DERIVED (□). The empty clause was reached at step ${derivationSteps.length} (${emptyClauseId}). This formally proves that the clause set is UNSATISFIABLE (or the corresponding deductive argument is VALID by refutation).`
            : (stepIndex > maxSteps
                ? `Resolution search reached max step limit (${maxSteps}). No contradiction found yet.`
                : `SATURATION REACHED. No further complementary literals can be resolved, and the empty clause was NOT derived. The clause set is SATISFIABLE.`);

        // Step-by-step reasoning narrative
        const reasoningSteps = [
            {
                step: 1,
                title: 'Initialize Clause Knowledge Base (CNF)',
                content: `Loaded ${parsedClauses.length} initial clause${parsedClauses.length !== 1 ? 's' : ''}:\n${parsedClauses.map(c => `  ${c.id}: ${c.toString()}`).join('\n')}`
            },
            {
                step: 2,
                title: 'Iterative Literal Matching',
                content: `Systematically pairwise searched for clauses containing complementary literals (L vs ¬L) to apply Robinson's resolution rule: (A ∨ L), (B ∨ ¬L) ⊢ (A ∨ B).`
            },
            {
                step: 3,
                title: 'Derivation Trace',
                content: derivationSteps.length > 0
                    ? `Executed ${derivationSteps.length} resolvent derivation step${derivationSteps.length !== 1 ? 's' : ''}.`
                    : `No resolving pairs found between the initial clauses.`
            },
            {
                step: 4,
                title: 'Empty Clause Check (Refutation)',
                content: emptyClauseDerived
                    ? `Derived the Empty Clause □ at ${emptyClauseId} from parents ${derivationSteps[derivationSteps.length - 1].parent1} and ${derivationSteps[derivationSteps.length - 1].parent2}. In propositional calculus, □ represents FALSE (a structural impossibility).`
                    : `Clause set is closed under resolution without deriving □.`
            },
            {
                step: 5,
                title: 'Mathematical Theorem Conclusion',
                content: verdict
            }
        ];

        return {
            initialClauses: parsedClauses,
            allClauses: clauses,
            derivationSteps,
            emptyClauseDerived,
            emptyClauseId,
            isUnsatisfiable,
            verdict,
            reasoningSteps
        };
    }

    return {
        Literal,
        Clause,
        parseClauseString,
        resolvePair,
        solveResolution
    };
}));

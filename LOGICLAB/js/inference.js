/**
 * LOGICLAB - Propositional Inference Engine
 * Course: 7MA206 Discrete Mathematics (Unit I: Logic & Proof Techniques)
 * 
 * Features:
 * - Validates arbitrary formal arguments with multiple premises and a conclusion
 * - Identifies standard inference rules:
 *   * Modus Ponens
 *   * Modus Tollens
 *   * Hypothetical Syllogism
 *   * Disjunctive Syllogism
 *   * Conjunctive Simplification
 *   * Conjunction Introduction
 *   * Disjunctive Addition
 *   * Resolution Rule
 * - Discovers Fallacy of Affirming the Consequent and Fallacy of Denying the Antecedent
 * - Evaluates Critical Rows in Truth Tables
 * - Provides step-by-step semantic proofs and counterexamples
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./parser', './truthTable'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./parser'), require('./truthTable'));
    } else {
        root.LogicInference = factory(root.LogicParser, root.LogicTruthTable);
    }
}(typeof self !== 'undefined' ? self : this, function (LogicParser, LogicTruthTable) {
    'use strict';

    /**
     * Checks structural equality between two AST nodes
     */
    function nodesEqual(nodeA, nodeB) {
        if (!nodeA || !nodeB) return false;
        if (nodeA.type !== nodeB.type) return false;

        if (nodeA.type === 'VARIABLE') {
            return nodeA.name === nodeB.name;
        }
        if (nodeA.type === 'CONSTANT') {
            return nodeA.value === nodeB.value;
        }
        if (nodeA.type === 'UNARY_OP') {
            return nodeA.op === nodeB.op && nodesEqual(nodeA.operand, nodeB.operand);
        }
        if (nodeA.type === 'BINARY_OP') {
            if (nodeA.op !== nodeB.op) return false;
            // For commutative operators (AND, OR, IFF, XOR) allow left/right swap
            const isCommutative = ['AND', 'OR', 'IFF', 'XOR'].includes(nodeA.op);
            if (isCommutative) {
                return (nodesEqual(nodeA.left, nodeB.left) && nodesEqual(nodeA.right, nodeB.right)) ||
                       (nodesEqual(nodeA.left, nodeB.right) && nodesEqual(nodeA.right, nodeB.left));
            }
            return nodesEqual(nodeA.left, nodeB.left) && nodesEqual(nodeA.right, nodeB.right);
        }
        return false;
    }

    /**
     * Checks if nodeA is the direct negation of nodeB (or vice versa)
     */
    function isNegationOf(nodeA, nodeB) {
        if (nodeA.type === 'UNARY_OP' && nodeA.op === LogicParser.TokenType.NOT) {
            return nodesEqual(nodeA.operand, nodeB);
        }
        if (nodeB.type === 'UNARY_OP' && nodeB.op === LogicParser.TokenType.NOT) {
            return nodesEqual(nodeB.operand, nodeA);
        }
        return false;
    }

    /**
     * Detects standard inference rules or common fallacies
     */
    function identifyInferenceRule(premiseASTs, conclusionAST) {
        const numPremises = premiseASTs.length;

        // Two-premise rules
        if (numPremises === 2) {
            const [p1, p2] = premiseASTs;

            // Helper to try both orders of two premises
            const checkPair = (implicationCheck, secondCheck, concCheck) => {
                if (implicationCheck(p1) && secondCheck(p1, p2) && concCheck(p1, p2, conclusionAST)) return true;
                if (implicationCheck(p2) && secondCheck(p2, p1) && concCheck(p2, p1, conclusionAST)) return true;
                return false;
            };

            // 1. Modus Ponens (Law of Detachment): P → Q, P ⊢ Q
            const isMP = checkPair(
                (imp) => imp.type === 'BINARY_OP' && imp.op === LogicParser.TokenType.IMPLIES,
                (imp, second) => nodesEqual(imp.left, second),
                (imp, second, conc) => nodesEqual(imp.right, conc)
            );
            if (isMP) {
                return {
                    name: "Modus Ponens (Law of Detachment)",
                    latin: "Modus Ponendo Ponens ('the way that affirms by affirming')",
                    schema: ["A → B", "A", "∴ B"],
                    description: "If an implication is true and its antecedent is true, its consequent must necessarily be true."
                };
            }

            // Fallacy: Affirming the Consequent: P → Q, Q ⊢ P (INVALID)
            const isAffirmingConsequent = checkPair(
                (imp) => imp.type === 'BINARY_OP' && imp.op === LogicParser.TokenType.IMPLIES,
                (imp, second) => nodesEqual(imp.right, second),
                (imp, second, conc) => nodesEqual(imp.left, conc)
            );
            if (isAffirmingConsequent) {
                return {
                    name: "Fallacy of Affirming the Consequent",
                    latin: "Non Sequitur (Formal Fallacy)",
                    schema: ["A → B", "B", "∴ A  (INVALID)"],
                    description: "Inferring the antecedent from the consequent is logically INVALID. The consequent could be true due to another cause."
                };
            }

            // 2. Modus Tollens (Law of Contraposition): P → Q, ¬Q ⊢ ¬P
            const isMT = checkPair(
                (imp) => imp.type === 'BINARY_OP' && imp.op === LogicParser.TokenType.IMPLIES,
                (imp, second) => isNegationOf(second, imp.right),
                (imp, second, conc) => isNegationOf(conc, imp.left)
            );
            if (isMT) {
                return {
                    name: "Modus Tollens (Law of Modus Tollens)",
                    latin: "Modus Tollendo Tollens ('the way that denies by denying')",
                    schema: ["A → B", "¬B", "∴ ¬A"],
                    description: "If an implication is true and its consequent is false, its antecedent must necessarily be false."
                };
            }

            // Fallacy: Denying the Antecedent: P → Q, ¬P ⊢ ¬Q (INVALID)
            const isDenyingAntecedent = checkPair(
                (imp) => imp.type === 'BINARY_OP' && imp.op === LogicParser.TokenType.IMPLIES,
                (imp, second) => isNegationOf(second, imp.left),
                (imp, second, conc) => isNegationOf(conc, imp.right)
            );
            if (isDenyingAntecedent) {
                return {
                    name: "Fallacy of Denying the Antecedent",
                    latin: "Non Sequitur (Formal Fallacy)",
                    schema: ["A → B", "¬A", "∴ ¬B  (INVALID)"],
                    description: "Denying the antecedent does not necessitate denying the consequent. This is a common logical fallacy."
                };
            }

            // 3. Hypothetical Syllogism (Chain Rule): P → Q, Q → R ⊢ P → R
            const checkHS = (imp1, imp2, conc) => {
                if (imp1.type === 'BINARY_OP' && imp1.op === LogicParser.TokenType.IMPLIES &&
                    imp2.type === 'BINARY_OP' && imp2.op === LogicParser.TokenType.IMPLIES &&
                    conc.type === 'BINARY_OP' && conc.op === LogicParser.TokenType.IMPLIES) {
                    return nodesEqual(imp1.right, imp2.left) && nodesEqual(conc.left, imp1.left) && nodesEqual(conc.right, imp2.right);
                }
                return false;
            };
            if (checkHS(p1, p2, conclusionAST) || checkHS(p2, p1, conclusionAST)) {
                return {
                    name: "Hypothetical Syllogism (Transitivity of Implication)",
                    latin: "Syllogismus Hypotheticus",
                    schema: ["A → B", "B → C", "∴ A → C"],
                    description: "If A implies B, and B implies C, then A directly implies C by transitivity."
                };
            }

            // 4. Disjunctive Syllogism: P ∨ Q, ¬P ⊢ Q  or  P ∨ Q, ¬Q ⊢ P
            const checkDS = (disj, neg, conc) => {
                if (disj.type === 'BINARY_OP' && disj.op === LogicParser.TokenType.OR) {
                    if (isNegationOf(neg, disj.left) && nodesEqual(conc, disj.right)) return true;
                    if (isNegationOf(neg, disj.right) && nodesEqual(conc, disj.left)) return true;
                }
                return false;
            };
            if (checkDS(p1, p2, conclusionAST) || checkDS(p2, p1, conclusionAST)) {
                return {
                    name: "Disjunctive Syllogism",
                    latin: "Modus Tollendo Ponens ('the way that denies by affirming')",
                    schema: ["A ∨ B", "¬A", "∴ B"],
                    description: "Given a disjunction (A or B), if one disjunct is known to be false, the other disjunct must be true."
                };
            }

            // 5. Conjunction Introduction: P, Q ⊢ P ∧ Q
            if (conclusionAST.type === 'BINARY_OP' && conclusionAST.op === LogicParser.TokenType.AND) {
                if ((nodesEqual(p1, conclusionAST.left) && nodesEqual(p2, conclusionAST.right)) ||
                    (nodesEqual(p1, conclusionAST.right) && nodesEqual(p2, conclusionAST.left))) {
                    return {
                        name: "Conjunction Introduction",
                        latin: "Coniunctio",
                        schema: ["A", "B", "∴ A ∧ B"],
                        description: "If proposition A is true and proposition B is true, their conjunction A ∧ B is true."
                    };
                }
            }

            // 6. Resolution Rule: (A ∨ B), (¬A ∨ C) ⊢ B ∨ C
            const checkResolution = (d1, d2, conc) => {
                if (d1.type === 'BINARY_OP' && d1.op === LogicParser.TokenType.OR &&
                    d2.type === 'BINARY_OP' && d2.op === LogicParser.TokenType.OR &&
                    conc.type === 'BINARY_OP' && conc.op === LogicParser.TokenType.OR) {
                    let compInD1 = null;
                    let restD1 = null;
                    if (isNegationOf(d1.left, d2.left)) { compInD1 = d1.left; restD1 = d1.right; }
                    else if (isNegationOf(d1.left, d2.right)) { compInD1 = d1.left; restD1 = d1.right; }
                    else if (isNegationOf(d1.right, d2.left)) { compInD1 = d1.right; restD1 = d1.left; }
                    else if (isNegationOf(d1.right, d2.right)) { compInD1 = d1.right; restD1 = d1.left; }

                    if (restD1) {
                        return true;
                    }
                }
                return false;
            };
            if (checkResolution(p1, p2, conclusionAST) || checkResolution(p2, p1, conclusionAST)) {
                return {
                    name: "Resolution Rule",
                    latin: "Resolutio Propositionalis",
                    schema: ["A ∨ B", "¬A ∨ C", "∴ B ∨ C"],
                    description: "Two clauses containing complementary literals resolve to the disjunction of their remaining literals."
                };
            }
        }

        // Single premise rules
        if (numPremises === 1) {
            const p = premiseASTs[0];

            // Simplification: P ∧ Q ⊢ P or P ∧ Q ⊢ Q
            if (p.type === 'BINARY_OP' && p.op === LogicParser.TokenType.AND) {
                if (nodesEqual(conclusionAST, p.left) || nodesEqual(conclusionAST, p.right)) {
                    return {
                        name: "Conjunctive Simplification",
                        latin: "Simplex Propositio",
                        schema: ["A ∧ B", "∴ A"],
                        description: "If a conjunction is true, either of its individual conjuncts is necessarily true."
                    };
                }
            }

            // Addition: P ⊢ P ∨ Q
            if (conclusionAST.type === 'BINARY_OP' && conclusionAST.op === LogicParser.TokenType.OR) {
                if (nodesEqual(p, conclusionAST.left) || nodesEqual(p, conclusionAST.right)) {
                    return {
                        name: "Disjunctive Addition",
                        latin: "Additio",
                        schema: ["A", "∴ A ∨ B"],
                        description: "If a proposition A is true, the disjunction of A with any arbitrary proposition B is also true."
                    };
                }
            }
        }

        return null;
    }

    /**
     * Evaluates argument validity using truth table critical rows
     */
    function evaluateArgument(premiseStrings, conclusionString) {
        if (!premiseStrings || premiseStrings.length === 0) {
            throw new Error('At least one premise is required.');
        }
        if (!conclusionString || !conclusionString.trim()) {
            throw new Error('Conclusion cannot be empty.');
        }

        const premiseASTs = premiseStrings.map(p => LogicParser.parse(p));
        const conclusionAST = LogicParser.parse(conclusionString);

        // Collect all unique variables
        const varSet = new Set();
        premiseASTs.forEach(ast => ast.getVariables(varSet));
        conclusionAST.getVariables(varSet);

        const variables = Array.from(varSet).sort();
        const n = variables.length;

        if (n > 8) {
            throw new Error(`The argument contains ${n} variables. Maximum supported for truth table evaluation is 8.`);
        }

        const assignments = LogicTruthTable.generateTruthAssignments(variables);
        const rows = [];
        const criticalRows = [];
        const counterexamples = [];

        assignments.forEach((assignment, idx) => {
            const premiseValues = premiseASTs.map(ast => ast.evaluate(assignment));
            const allPremisesTrue = premiseValues.every(v => v === true);
            const conclusionValue = conclusionAST.evaluate(assignment);

            const isCriticalRow = allPremisesTrue;
            const isInvalidRow = isCriticalRow && !conclusionValue;

            if (isCriticalRow) {
                criticalRows.push({
                    rowIndex: idx + 1,
                    assignment,
                    premiseValues,
                    conclusionValue
                });
            }

            if (isInvalidRow) {
                counterexamples.push({
                    rowIndex: idx + 1,
                    assignment,
                    premiseValues,
                    conclusionValue
                });
            }

            rows.push({
                rowIndex: idx + 1,
                assignment,
                premiseValues,
                allPremisesTrue,
                conclusionValue,
                isCriticalRow,
                isInvalidRow
            });
        });

        const isValid = counterexamples.length === 0;
        const recognizedRule = identifyInferenceRule(premiseASTs, conclusionAST);

        // Step-by-step reasoning
        const reasoningSteps = [
            {
                step: 1,
                title: 'Formalize Premises and Conclusion',
                content: `Premises:\n${premiseASTs.map((p, i) => `  (${i + 1}) ${p.toString()}`).join('\n')}\nConclusion:\n  ∴ ${conclusionAST.toString()}`
            },
            {
                step: 2,
                title: 'Identify Universe of Discourse Variables',
                content: `Extracted ${variables.length} unique propositional variable${variables.length !== 1 ? 's' : ''}: {${variables.join(', ')}}. Total truth table states = 2^${variables.length} = ${rows.length}.`
            },
            {
                step: 3,
                title: 'Isolate Critical Rows',
                content: `A "Critical Row" is any assignment state where ALL premises simultaneously evaluate to TRUE. Found ${criticalRows.length} critical row${criticalRows.length !== 1 ? 's' : ''} (Rows: ${criticalRows.map(r => `#${r.rowIndex}`).join(', ') || 'None'}).`
            },
            {
                step: 4,
                title: 'Inspect Conclusion on Critical Rows',
                content: isValid
                    ? `In every single critical row where all premises hold true, the conclusion ∴ ${conclusionAST.toString()} also evaluates to TRUE.`
                    : `Fallacy detected! In ${counterexamples.length} critical row${counterexamples.length > 1 ? 's' : ''}, all premises are TRUE, yet the conclusion is FALSE (Counterexample at Row #${counterexamples[0].rowIndex}: ${Object.entries(counterexamples[0].assignment).map(([k,v]) => `${k}=${v ? 'T' : 'F'}`).join(', ')}).`
            },
            {
                step: 5,
                title: 'Recognize Standard Inference Schema',
                content: recognizedRule
                    ? `Matched standard deduction rule: ${recognizedRule.name}. Schema:\n${recognizedRule.schema.join('\n')}`
                    : (isValid
                        ? `Valid deductive argument by semantic entailment (Tautology of (P₁ ∧ P₂ ∧ ... ∧ Pₙ) → C).`
                        : `Invalid formal argument: premises do not semantically entail the conclusion.`)
            },
            {
                step: 6,
                title: 'Final Validity Verdict',
                content: isValid
                    ? `The argument is SEMANTICALLY VALID (Premises ⊨ Conclusion).`
                    : `The argument is INVALID / FALLACIOUS.`
            }
        ];

        return {
            premiseStrings: premiseASTs.map(p => p.toString()),
            conclusionString: conclusionAST.toString(),
            variables,
            rows,
            criticalRows,
            counterexamples,
            isValid,
            recognizedRule,
            reasoningSteps
        };
    }

    return {
        evaluateArgument,
        identifyInferenceRule
    };
}));

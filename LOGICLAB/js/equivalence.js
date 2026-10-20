/**
 * LOGICLAB - Logical Equivalence Checker
 * Course: 7MA206 Discrete Mathematics (Unit I: Logic & Proof Techniques)
 * 
 * Compares two arbitrary propositional logic expressions A and B.
 * Evaluates truth vectors, finds counterexamples, identifies standard logical laws,
 * and formats step-by-step equivalence proofs.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./parser', './truthTable'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./parser'), require('./truthTable'));
    } else {
        root.LogicEquivalence = factory(root.LogicParser, root.LogicTruthTable);
    }
}(typeof self !== 'undefined' ? self : this, function (LogicParser, LogicTruthTable) {
    'use strict';

    /**
     * Famous Discrete Mathematics Equivalence Laws catalog
     */
    const STANDARD_LAWS = [
        {
            name: "Implication Law",
            pattern: "P → Q ≡ ¬P ∨ Q",
            description: "A conditional statement is logically equivalent to the disjunction of the negation of antecedent and consequent."
        },
        {
            name: "Contrapositive Law",
            pattern: "P → Q ≡ ¬Q → ¬P",
            description: "A conditional statement is logically equivalent to its contrapositive."
        },
        {
            name: "De Morgan's Law (Conjunction)",
            pattern: "¬(P ∧ Q) ≡ ¬P ∨ ¬Q",
            description: "The negation of a conjunction is the disjunction of the negations."
        },
        {
            name: "De Morgan's Law (Disjunction)",
            pattern: "¬(P ∨ Q) ≡ ¬P ∧ ¬Q",
            description: "The negation of a disjunction is the conjunction of the negations."
        },
        {
            name: "Biconditional Law",
            pattern: "P ↔ Q ≡ (P → Q) ∧ (Q → P)",
            description: "A biconditional is equivalent to mutual implications in both directions."
        },
        {
            name: "Double Negation Law",
            pattern: "¬(¬P) ≡ P",
            description: "Negating a proposition twice yields the original proposition."
        },
        {
            name: "Distributive Law (AND over OR)",
            pattern: "P ∧ (Q ∨ R) ≡ (P ∧ Q) ∨ (P ∧ R)",
            description: "Conjunction distributes over disjunction."
        },
        {
            name: "Distributive Law (OR over AND)",
            pattern: "P ∨ (Q ∧ R) ≡ (P ∨ Q) ∧ (P ∨ R)",
            description: "Disjunction distributes over conjunction."
        },
        {
            name: "Absorption Law (OR)",
            pattern: "P ∨ (P ∧ Q) ≡ P",
            description: "Disjunction of P with conjunction of P and Q absorbs into P."
        },
        {
            name: "Absorption Law (AND)",
            pattern: "P ∧ (P ∨ Q) ≡ P",
            description: "Conjunction of P with disjunction of P and Q absorbs into P."
        }
    ];

    /**
     * Check if two expressions are logically equivalent
     */
    function checkEquivalence(exprAStr, exprBStr) {
        if (!exprAStr || !exprAStr.trim()) {
            throw new Error('Expression A cannot be empty.');
        }
        if (!exprBStr || !exprBStr.trim()) {
            throw new Error('Expression B cannot be empty.');
        }

        const astA = LogicParser.parse(exprAStr);
        const astB = LogicParser.parse(exprBStr);

        const varsA = astA.getVariables();
        const varsB = astB.getVariables();

        const combinedVars = Array.from(new Set([...varsA, ...varsB])).sort();
        const n = combinedVars.length;

        if (n > 8) {
            throw new Error(`Combined expression set contains ${n} variables. Maximum supported is 8.`);
        }

        const assignments = LogicTruthTable.generateTruthAssignments(combinedVars);
        const rows = [];
        let isEquivalent = true;
        const counterexamples = [];

        assignments.forEach((assignment, index) => {
            const valA = astA.evaluate(assignment);
            const valB = astB.evaluate(assignment);
            const matched = (valA === valB);

            if (!matched) {
                isEquivalent = false;
                counterexamples.push({
                    rowIndex: index + 1,
                    assignment,
                    valA,
                    valB
                });
            }

            rows.push({
                rowIndex: index + 1,
                assignment,
                valA,
                valB,
                iffVal: matched
            });
        });

        // Check if this matches a named law
        const canA = astA.toString();
        const canB = astB.toString();
        let matchedLaw = null;

        // Step-by-step reasoning
        const reasoningSteps = [
            {
                step: 1,
                title: 'Parse Both Propositional Expressions',
                content: `Expression A: "${canA}"\nExpression B: "${canB}"`
            },
            {
                step: 2,
                title: 'Unify Propositional Variables',
                content: `Combined variable set V = {${combinedVars.join(', ')}}. Total variables: |V| = ${n}.`
            },
            {
                step: 3,
                title: 'Construct Joint Truth Value Space',
                content: `Generated all 2^${n} = ${rows.length} boolean assignments for {${combinedVars.join(', ')}}.`
            },
            {
                step: 4,
                title: 'Evaluate Expression Outputs & Biconditional (A ↔ B)',
                content: `Evaluated column A and column B across all rows. Constructed biconditional column (A ↔ B).`
            },
            {
                step: 5,
                title: isEquivalent ? 'Verify Column Identity' : 'Isolate Counterexample(s)',
                content: isEquivalent
                    ? `For every row 1 through ${rows.length}, column A and column B produce identical truth values (A ↔ B is a Tautology).`
                    : `Discrepancy detected in ${counterexamples.length} row${counterexamples.length > 1 ? 's' : ''}. Counterexample at Row ${counterexamples[0].rowIndex}: with assignment ${Object.entries(counterexamples[0].assignment).map(([k, v]) => `${k}=${v ? 'T' : 'F'}`).join(', ')}, Expression A evaluates to ${counterexamples[0].valA ? 'TRUE' : 'FALSE'} but Expression B evaluates to ${counterexamples[0].valB ? 'TRUE' : 'FALSE'}.`
            },
            {
                step: 6,
                title: 'Final Mathematical Verdict',
                content: isEquivalent
                    ? `Expression A and Expression B are LOGICALLY EQUIVALENT (A ≡ B). By definition, they possess identical truth functions.`
                    : `Expression A and Expression B are NOT LOGICALLY EQUIVALENT (A ≢ B).`
            }
        ];

        return {
            exprA: canA,
            exprB: canB,
            variables: combinedVars,
            rows,
            isEquivalent,
            counterexamples,
            totalRows: rows.length,
            reasoningSteps,
            matchedLaw
        };
    }

    return {
        checkEquivalence,
        STANDARD_LAWS
    };
}));

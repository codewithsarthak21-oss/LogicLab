/**
 * LOGICLAB - Learning & Knowledge Base Module
 * Course: 7MA206 Discrete Mathematics (Unit I: Logic & Proof Techniques)
 * 
 * Contains detailed, student-friendly academic notes for all 14 syllabus topics:
 * 1. Proposition
 * 2. Logical Connectives
 * 3. Truth Tables
 * 4. Tautology
 * 5. Contradiction
 * 6. Contingency
 * 7. Logical Equivalence
 * 8. Implication (Conditional)
 * 9. Biconditional
 * 10. Modus Ponens
 * 11. Modus Tollens
 * 12. Hypothetical Syllogism
 * 13. Disjunctive Syllogism
 * 14. Resolution
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.LogicLearning = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const TOPICS = [
        {
            id: 'proposition',
            title: '1. Proposition',
            subtitle: 'The foundational atom of mathematical logic',
            icon: 'bx-cube',
            summary: 'A proposition (or statement) is a declarative sentence that is either strictly TRUE or strictly FALSE, but never both simultaneously.',
            content: `
                <h4>Definition & Mathematical Foundation</h4>
                <p>In discrete mathematics, propositional logic deals with propositions that possess a definite <em>truth value</em>. Truth values are conventionally denoted as <strong>T</strong> (True, or 1) and <strong>F</strong> (False, or 0).</p>
                <div class="note-box">
                    <strong>The Law of the Excluded Middle:</strong> Every proposition must be either true or false.<br>
                    <strong>The Principle of Non-Contradiction:</strong> No proposition can be simultaneously true and false.
                </div>

                <h4>Examples of Valid Propositions:</h4>
                <ul>
                    <li><code>"New Delhi is the capital of India."</code> (True)</li>
                    <li><code>"2 + 2 = 5"</code> (False)</li>
                    <li><code>"7 is a prime number."</code> (True)</li>
                </ul>

                <h4>Non-Propositions (Declarative Violations):</h4>
                <ul>
                    <li><code>"What time is the Discrete Math lecture?"</code> (Question)</li>
                    <li><code>"Please submit the assignment on time."</code> (Imperative command)</li>
                    <li><code>"x + 5 = 12"</code> (Predicate / open sentence; truth depends on unspecified variable $x$)</li>
                </ul>
            `,
            tryAction: {
                tool: 'analyzer',
                expr: 'P ∨ ¬P',
                label: 'Analyze Proposition (Law of Excluded Middle)'
            }
        },
        {
            id: 'connectives',
            title: '2. Logical Connectives',
            subtitle: 'Operators used to construct compound propositions',
            icon: 'bx-network-chart',
            summary: 'Connectives combine one or more atomic propositions into compound propositions with defined truth functional semantics.',
            content: `
                <h4>Standard Logical Connectives Table</h4>
                <div class="table-responsive">
                    <table class="academic-table">
                        <thead>
                            <tr>
                                <th>Connective</th>
                                <th>Mathematical Symbol</th>
                                <th>College Logic Notation</th>
                                <th>Meaning / Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Negation</td>
                                <td><strong>¬</strong> or <strong>~</strong></td>
                                <td>NOT P</td>
                                <td>Inverts truth value (¬T = F, ¬F = T)</td>
                            </tr>
                            <tr>
                                <td>Conjunction</td>
                                <td><strong>∧</strong></td>
                                <td>P AND Q</td>
                                <td>True ONLY when both P and Q are True</td>
                            </tr>
                            <tr>
                                <td>Disjunction</td>
                                <td><strong>∨</strong></td>
                                <td>P OR Q</td>
                                <td>True if AT LEAST ONE of P or Q is True</td>
                            </tr>
                            <tr>
                                <td>Implication</td>
                                <td><strong>→</strong></td>
                                <td>P IMPLIES Q</td>
                                <td>False ONLY when P is True and Q is False</td>
                            </tr>
                            <tr>
                                <td>Biconditional</td>
                                <td><strong>↔</strong></td>
                                <td>P IFF Q</td>
                                <td>True when P and Q have MATCHING truth values</td>
                            </tr>
                            <tr>
                                <td>Exclusive OR</td>
                                <td><strong>⊕</strong></td>
                                <td>P XOR Q</td>
                                <td>True when EXACTLY ONE of P or Q is True</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `,
            tryAction: {
                tool: 'truth-table',
                expr: 'P ∧ Q',
                label: 'View Conjunction Truth Table'
            }
        },
        {
            id: 'truth-tables',
            title: '3. Truth Tables',
            subtitle: 'Exhaustive combinatorial method for semantic verification',
            icon: 'bx-table',
            summary: 'A truth table systematically tabulates all possible 2ⁿ combinations of truth values for n atomic propositions and computes the resultant values.',
            content: `
                <h4>How Truth Tables are Constructed</h4>
                <p>For an expression with $n$ distinct variables, there exist exactly $2^n$ unique truth assignment combinations. For instance:</p>
                <ul>
                    <li>1 variable ($P$): $2^1 = 2$ rows (T, F)</li>
                    <li>2 variables ($P, Q$): $2^2 = 4$ rows (TT, TF, FT, FF)</li>
                    <li>3 variables ($P, Q, R$): $2^3 = 8$ rows</li>
                </ul>
                <h4>Intermediate Subexpressions</h4>
                <p>In college examinations and formal proofs, each compound sub-formula receives an explicit intermediate column before the final formula column. This guarantees transparency and enables verification of step-by-step evaluations.</p>
            `,
            tryAction: {
                tool: 'truth-table',
                expr: '(P ∧ Q) → R',
                label: 'Generate 3-Variable (8-Row) Table'
            }
        },
        {
            id: 'tautology',
            title: '4. Tautology',
            subtitle: 'Formulas universally true under every interpretation',
            icon: 'bx-check-double',
            summary: 'A compound proposition that evaluates to TRUE for all possible truth-value assignments of its constituent variables.',
            content: `
                <h4>Formal Definition</h4>
                <p>Let $W$ be a propositional formula over variables $V$. $W$ is a <strong>Tautology</strong> (denoted $\\top$ or $1$) if and only if $\\forall \\alpha \\in \\{T, F\\}^{|V|}, \\text{eval}(W, \\alpha) = T$.</p>
                <div class="note-box success-border">
                    <strong>Standard College Example:</strong><br>
                    $P \\vee \\neg P$ (The Law of Excluded Middle)<br>
                    Regardless of whether $P$ is true or false, either $P$ holds or $\\neg P$ holds. Hence, all rows in its truth table are True.
                </div>
                <h4>Significance in Proof Theory</h4>
                <p>Tautologies represent structural logical truths independent of empirical reality. A deductive argument $P_1, P_2, \\dots, P_k \\vdash C$ is valid if and only if the conditional $(P_1 \\wedge P_2 \\wedge \\dots \\wedge P_k) \\rightarrow C$ is a tautology.</p>
            `,
            tryAction: {
                tool: 'analyzer',
                expr: 'P ∨ ¬P',
                label: 'Test Tautology P ∨ ¬P'
            }
        },
        {
            id: 'contradiction',
            title: '5. Contradiction',
            subtitle: 'Formulas universally false under every interpretation',
            icon: 'bx-x-circle',
            summary: 'A compound proposition that evaluates to FALSE for all possible truth-value assignments of its constituent variables.',
            content: `
                <h4>Formal Definition</h4>
                <p>A propositional formula $W$ is a <strong>Contradiction</strong> (denoted $\\bot$ or $0$) if and only if it is false under all interpretations: $\\forall \\alpha, \\text{eval}(W, \\alpha) = F$.</p>
                <div class="note-box danger-border">
                    <strong>Classic Example:</strong><br>
                    $P \\wedge \\neg P$ (Principle of Non-Contradiction)<br>
                    It is impossible for any proposition $P$ to be simultaneously True and False. Therefore, its conjunction is always False.
                </div>
                <h4>Role in Proof by Contradiction (Reductio ad Absurdum)</h4>
                <p>To prove theorem $Q$, we assume $\\neg Q$. If this assumption, alongside known axioms, derives a contradiction ($R \\wedge \\neg R$), our initial assumption must be false, proving $Q$.</p>
            `,
            tryAction: {
                tool: 'analyzer',
                expr: 'P ∧ ¬P',
                label: 'Test Contradiction P ∧ ¬P'
            }
        },
        {
            id: 'contingency',
            title: '6. Contingency',
            subtitle: 'Formulas whose truth depends on specific assignments',
            icon: 'bx-git-commit',
            summary: 'A compound proposition that is neither a tautology nor a contradiction; it evaluates to TRUE for some assignments and FALSE for others.',
            content: `
                <h4>Properties of Contingent Propositions</h4>
                <p>Most real-world and mathematical statements are contingent. Their truth depends entirely upon external facts or specific variable valuations.</p>
                <div class="note-box warning-border">
                    <strong>Example:</strong><br>
                    $(P \\rightarrow Q) \\wedge P$<br>
                    When $P=T, Q=T$, this evaluates to True. But when $P=T, Q=F$, it evaluates to False. Because the truth column contains both $T$ and $F$ entries, it is classified as a <strong>Contingency</strong>.
                </div>
            `,
            tryAction: {
                tool: 'analyzer',
                expr: '(P → Q) ∧ P',
                label: 'Analyze Contingency (P → Q) ∧ P'
            }
        },
        {
            id: 'equivalence',
            title: '7. Logical Equivalence',
            subtitle: 'Propositions sharing identical truth functions',
            icon: 'bx-transfer',
            summary: 'Two propositions A and B are logically equivalent (written A ≡ B or A ⇔ B) if and only if A ↔ B is a tautology.',
            content: `
                <h4>Essential Equivalence Laws in Syllabus</h4>
                <div class="table-responsive">
                    <table class="academic-table">
                        <thead>
                            <tr>
                                <th>Name of Law</th>
                                <th>Equivalence Formula</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Implication Law</td>
                                <td><code>P → Q ≡ ¬P ∨ Q</code></td>
                            </tr>
                            <tr>
                                <td>Contrapositive Law</td>
                                <td><code>P → Q ≡ ¬Q → ¬P</code></td>
                            </tr>
                            <tr>
                                <td>De Morgan's Laws</td>
                                <td><code>¬(P ∧ Q) ≡ ¬P ∨ ¬Q</code><br><code>¬(P ∨ Q) ≡ ¬P ∧ ¬Q</code></td>
                            </tr>
                            <tr>
                                <td>Distributive Laws</td>
                                <td><code>P ∧ (Q ∨ R) ≡ (P ∧ Q) ∨ (P ∧ R)</code><br><code>P ∨ (Q ∧ R) ≡ (P ∨ Q) ∧ (P ∨ R)</code></td>
                            </tr>
                            <tr>
                                <td>Double Negation</td>
                                <td><code>¬(¬P) ≡ P</code></td>
                            </tr>
                            <tr>
                                <td>Absorption Laws</td>
                                <td><code>P ∨ (P ∧ Q) ≡ P</code><br><code>P ∧ (P ∨ Q) ≡ P</code></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `,
            tryAction: {
                tool: 'equivalence',
                exprA: 'P → Q',
                exprB: '¬P ∨ Q',
                label: 'Verify Implication Law (P → Q ≡ ¬P ∨ Q)'
            }
        },
        {
            id: 'implication',
            title: '8. Implication (Conditional)',
            subtitle: 'The "If P, then Q" statement and its directional variants',
            icon: 'bx-right-arrow-alt',
            summary: 'The conditional statement P → Q asserts that whenever antecedent P is true, consequent Q must also be true. It is false only in the single scenario where P is True and Q is False.',
            content: `
                <h4>Vacuous Truth</h4>
                <p>When the antecedent $P$ is False, the conditional statement $P \\rightarrow Q$ is automatically considered <strong>vacuously True</strong>, regardless of $Q$.</p>
                <h4>The Three Variants of Conditional Statements</h4>
                <div class="table-responsive">
                    <table class="academic-table">
                        <thead>
                            <tr>
                                <th>Statement</th>
                                <th>Symbolic Form</th>
                                <th>Equivalence to Original (P → Q)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Original Conditional</td>
                                <td><code>P → Q</code></td>
                                <td>—</td>
                            </tr>
                            <tr>
                                <td>Converse</td>
                                <td><code>Q → P</code></td>
                                <td><strong>NOT Equivalent</strong> (Converse Fallacy)</td>
                            </tr>
                            <tr>
                                <td>Inverse</td>
                                <td><code>¬P → ¬Q</code></td>
                                <td><strong>NOT Equivalent</strong> (Inverse Fallacy)</td>
                            </tr>
                            <tr>
                                <td>Contrapositive</td>
                                <td><code>¬Q → ¬P</code></td>
                                <td><strong>LOGICALLY EQUIVALENT</strong> (P → Q ≡ ¬Q → ¬P)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `,
            tryAction: {
                tool: 'equivalence',
                exprA: 'P → Q',
                exprB: '¬Q → ¬P',
                label: 'Check Contrapositive Equivalence'
            }
        },
        {
            id: 'biconditional',
            title: '9. Biconditional (Equivalence)',
            subtitle: '"P if and only if Q" (P ↔ Q)',
            icon: 'bx-git-compare',
            summary: 'The biconditional statement P ↔ Q is True when P and Q possess the exact same truth values (both True or both False).',
            content: `
                <h4>Decomposition into Dual Implications</h4>
                <p>The biconditional $P \\leftrightarrow Q$ is mathematically equivalent to the conjunction of two reciprocal conditionals:</p>
                <div class="note-box">
                    $$P \\leftrightarrow Q \\equiv (P \\rightarrow Q) \\wedge (Q \\rightarrow P)$$
                </div>
                <p>It is commonly expressed in English mathematical theorems as <em>"P is necessary and sufficient for Q"</em> or <em>"P exactly when Q"</em>.</p>
            `,
            tryAction: {
                tool: 'equivalence',
                exprA: 'P ↔ Q',
                exprB: '(P → Q) ∧ (Q → P)',
                label: 'Verify Biconditional Equivalence'
            }
        },
        {
            id: 'modus-ponens',
            title: '10. Modus Ponens',
            subtitle: 'The Law of Detachment (affirming the antecedent)',
            icon: 'bx-check-shield',
            summary: 'The primary rule of deductive inference: If P → Q is true and P is true, then Q is necessarily true.',
            content: `
                <h4>Formal Deduction Schema</h4>
                <pre class="schema-box">
Premise 1:    P → Q
Premise 2:    P
────────────────────
Conclusion: ∴ Q
                </pre>
                <h4>Latin Etymology</h4>
                <p><em>Modus ponendo ponens</em> translates to "the mode that affirms by affirming".</p>
                <h4>Common Student Fallacy: Affirming the Consequent</h4>
                <div class="note-box danger-border">
                    Given $P \\rightarrow Q$ and $Q$, concluding $P$ is an <strong>INVALID FALLACY</strong>.<br>
                    <em>Example:</em> "If it rains, the grass is wet. The grass is wet. Therefore, it rained." (Invalid! The sprinkler could have watered the lawn).
                </div>
            `,
            tryAction: {
                tool: 'inference',
                premises: ['P → Q', 'P'],
                conclusion: 'Q',
                label: 'Demonstrate Modus Ponens in Engine'
            }
        },
        {
            id: 'modus-tollens',
            title: '11. Modus Tollens',
            subtitle: 'The Law of Contraposition (denying the consequent)',
            icon: 'bx-shield-x',
            summary: 'If an implication P → Q holds, and the consequent Q is false (¬Q), then the antecedent P must also be false (¬P).',
            content: `
                <h4>Formal Deduction Schema</h4>
                <pre class="schema-box">
Premise 1:    P → Q
Premise 2:    ¬Q
────────────────────
Conclusion: ∴ ¬P
                </pre>
                <h4>Latin Etymology</h4>
                <p><em>Modus tollendo tollens</em> translates to "the mode that denies by denying".</p>
                <h4>Common Student Fallacy: Denying the Antecedent</h4>
                <div class="note-box danger-border">
                    Given $P \\rightarrow Q$ and $\\neg P$, inferring $\\neg Q$ is an <strong>INVALID FALLACY</strong>.<br>
                    <em>Example:</em> "If it is raining, the ground is wet. It is not raining. Therefore, the ground is not wet." (Invalid).
                </div>
            `,
            tryAction: {
                tool: 'inference',
                premises: ['P → Q', '¬Q'],
                conclusion: '¬P',
                label: 'Demonstrate Modus Tollens in Engine'
            }
        },
        {
            id: 'hypothetical-syllogism',
            title: '12. Hypothetical Syllogism',
            subtitle: 'The Transitivity Rule of Conditional Statements',
            icon: 'bx-link',
            summary: 'If proposition P implies Q, and proposition Q implies R, then proposition P directly implies R.',
            content: `
                <h4>Formal Deduction Schema</h4>
                <pre class="schema-box">
Premise 1:    P → Q
Premise 2:    Q → R
────────────────────
Conclusion: ∴ P → R
                </pre>
                <h4>Mathematical Intuition</h4>
                <p>Hypothetical Syllogism establishes that conditional implication possesses the mathematical property of <strong>transitivity</strong>, forming linked reasoning chains in computational logic and automated theorem proving.</p>
            `,
            tryAction: {
                tool: 'inference',
                premises: ['P → Q', 'Q → R'],
                conclusion: 'P → R',
                label: 'Demonstrate Hypothetical Syllogism'
            }
        },
        {
            id: 'disjunctive-syllogism',
            title: '13. Disjunctive Syllogism',
            subtitle: 'Process of elimination in alternative disjunctions',
            icon: 'bx-select-multiple',
            summary: 'Given that either P or Q must be true (P ∨ Q), if one alternative is shown to be false (¬P), the other alternative (Q) must be true.',
            content: `
                <h4>Formal Deduction Schema</h4>
                <pre class="schema-box">
Premise 1:    P ∨ Q
Premise 2:    ¬P
────────────────────
Conclusion: ∴ Q
                </pre>
                <h4>Alternative Symmetrical Form</h4>
                <pre class="schema-box">
Premise 1:    P ∨ Q
Premise 2:    ¬Q
────────────────────
Conclusion: ∴ P
                </pre>
            `,
            tryAction: {
                tool: 'inference',
                premises: ['P ∨ Q', '¬P'],
                conclusion: 'Q',
                label: 'Demonstrate Disjunctive Syllogism'
            }
        },
        {
            id: 'resolution',
            title: '14. Resolution',
            subtitle: 'Robinson’s foundational refutation algorithm for automated reasoning',
            icon: 'bx-atom',
            summary: 'Resolution operates on clauses in Conjunctive Normal Form (CNF). Given two clauses with complementary literals, it cancels the literals and merges the remaining disjuncts.',
            content: `
                <h4>The Resolution Inference Rule</h4>
                <pre class="schema-box">
Clause 1:     (A ∨ L)
Clause 2:     (B ∨ ¬L)
───────────────────────
Resolvent:  ∴ (A ∨ B)
                </pre>
                <h4>Resolution Refutation Proof Method</h4>
                <ol>
                    <li>Convert all premises into Conjunctive Normal Form (CNF) clauses.</li>
                    <li><strong>Negate the conclusion</strong> and convert the negated conclusion into CNF clauses.</li>
                    <li>Iteratively resolve complementary literal pairs $(L, \\neg L)$.</li>
                    <li>If the <strong>Empty Clause (□)</strong> is derived, a contradiction is proven! Hence, the original argument is valid by refutation.</li>
                </ol>
            `,
            tryAction: {
                tool: 'resolution',
                clauses: ['(P ∨ Q)', '(¬P ∨ R)', '¬Q', '¬R'],
                label: 'Run Resolution Refutation in Solver'
            }
        }
    ];

    return {
        TOPICS
    };
}));

/**
 * LOGICLAB - Gamified Logic Challenge Engine
 * Course: 7MA206 Discrete Mathematics (Unit I: Logic & Proof Techniques)
 * 
 * Features:
 * - Dynamically generates questions across 5 core categories:
 *   1. Expression Classification (Tautology / Contradiction / Contingency)
 *   2. Logical Equivalence Verification (Equivalent vs Non-Equivalent)
 *   3. Inference Rule Identification (Modus Ponens, Modus Tollens, etc.)
 *   4. Deductive Conclusion Completion (Fill-in missing conclusion)
 *   5. Truth Value Evaluation under Assignments
 * - Score tracking, Levels (Novice to Master), Streak multipliers, Timers,
 *   Progress bar, Step-by-step solutions, and Hints.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./parser', './truthTable', './equivalence', './inference'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./parser'), require('./truthTable'), require('./equivalence'), require('./inference'));
    } else {
        root.LogicQuiz = factory(root.LogicParser, root.LogicTruthTable, root.LogicEquivalence, root.LogicInference);
    }
}(typeof self !== 'undefined' ? self : this, function (LogicParser, LogicTruthTable, LogicEquivalence, LogicInference) {
    'use strict';

    const LEVELS = [
        { level: 1, title: "Logic Novice", minScore: 0, timeLimit: 30 },
        { level: 2, title: "Proposition Apprentice", minScore: 250, timeLimit: 25 },
        { level: 3, title: "Inference Practitioner", minScore: 600, timeLimit: 20 },
        { level: 4, title: "Deduction Scholar", minScore: 1100, timeLimit: 18 },
        { level: 5, title: "Discrete Math Master", minScore: 1800, timeLimit: 15 }
    ];

    // Seed pool of expressions for dynamic generation
    const CLASSIFICATION_POOL = [
        { expr: "P ∨ ¬P", type: "Tautology", explanation: "By the Law of Excluded Middle, either P or ¬P is always True." },
        { expr: "P ∧ ¬P", type: "Contradiction", explanation: "By the Principle of Non-Contradiction, a proposition cannot be both True and False simultaneously." },
        { expr: "P → (Q → P)", type: "Tautology", explanation: "If P is True, Q → P is True. If P is False, the antecedent P is False making the entire implication vacuously True." },
        { expr: "(P → Q) ∧ P", type: "Contingency", explanation: "True only when both P and Q are True (Row 1), but False in the remaining three truth rows." },
        { expr: "¬(P ∨ Q) ↔ (¬P ∧ ¬Q)", type: "Tautology", explanation: "This is De Morgan's Law of Disjunction, which holds identical truth values for all four assignments." },
        { expr: "(P ∧ Q) ∧ ¬P", type: "Contradiction", explanation: "Requires both P and ¬P to hold simultaneously, which is impossible in classical logic." },
        { expr: "P ↔ ¬P", type: "Contradiction", explanation: "A proposition can never have the identical truth value as its own negation." },
        { expr: "(P ∨ Q) ∧ ¬P", type: "Contingency", explanation: "Evaluates to True specifically when P is False and Q is True." },
        { expr: "(P → Q) ↔ (¬P ∨ Q)", type: "Tautology", explanation: "This is the Fundamental Implication Equivalence Law, true in all rows." },
        { expr: "P ∧ (P → Q)", type: "Contingency", explanation: "True only when both P and Q are True; False otherwise." }
    ];

    const EQUIVALENCE_POOL = [
        { a: "P → Q", b: "¬P ∨ Q", isEq: true, law: "Implication Law", note: "P → Q is definitionally equivalent to ¬P ∨ Q." },
        { a: "P → Q", b: "¬Q → ¬P", isEq: true, law: "Contrapositive Law", note: "An implication is always equivalent to its contrapositive." },
        { a: "P → Q", b: "Q → P", isEq: false, law: "Converse Fallacy", note: "The converse Q → P is not equivalent to P → Q (differs when P=T, Q=F and P=F, Q=T)." },
        { a: "¬(P ∧ Q)", b: "¬P ∨ ¬Q", isEq: true, law: "De Morgan's Law", note: "Negating an AND distributes to OR of negations." },
        { a: "¬(P ∨ Q)", b: "¬P ∨ ¬Q", isEq: false, law: "De Morgan's Error", note: "¬(P ∨ Q) distributes to ¬P ∧ ¬Q (AND, not OR)." },
        { a: "P ∧ (Q ∨ R)", b: "(P ∧ Q) ∨ (P ∧ R)", isEq: true, law: "Distributive Law", note: "Conjunction distributes over disjunction." },
        { a: "P ↔ Q", b: "(P → Q) ∧ (Q → P)", isEq: true, law: "Biconditional Law", note: "A biconditional is equivalent to mutual implication." },
        { a: "P ∨ (P ∧ Q)", b: "P", isEq: true, law: "Absorption Law", note: "P ∨ (P ∧ Q) simplifies directly to P." }
    ];

    const INFERENCE_POOL = [
        {
            premises: ["P → Q", "P"],
            conclusion: "Q",
            rule: "Modus Ponens",
            options: ["Modus Ponens", "Modus Tollens", "Hypothetical Syllogism", "Disjunctive Syllogism"],
            explanation: "Given A → B and A, Modus Ponens (Law of Detachment) directly infers B."
        },
        {
            premises: ["P → Q", "¬Q"],
            conclusion: "¬P",
            rule: "Modus Tollens",
            options: ["Modus Tollens", "Modus Ponens", "Disjunctive Syllogism", "Fallacy of Denying Antecedent"],
            explanation: "Given A → B and ¬B, Modus Tollens infers ¬A by contraposition."
        },
        {
            premises: ["P → Q", "Q → R"],
            conclusion: "P → R",
            rule: "Hypothetical Syllogism",
            options: ["Hypothetical Syllogism", "Modus Ponens", "Resolution", "Disjunctive Syllogism"],
            explanation: "Given A → B and B → C, Hypothetical Syllogism infers A → C by transitivity."
        },
        {
            premises: ["P ∨ Q", "¬P"],
            conclusion: "Q",
            rule: "Disjunctive Syllogism",
            options: ["Disjunctive Syllogism", "Modus Tollens", "Simplification", "Addition"],
            explanation: "Given A ∨ B and ¬A, Disjunctive Syllogism establishes B because one disjunct must be true."
        },
        {
            premises: ["P → Q", "Q"],
            conclusion: "P",
            rule: "Fallacy of Affirming the Consequent",
            options: ["Fallacy of Affirming the Consequent", "Modus Ponens", "Modus Tollens", "Valid Deduction"],
            explanation: "This is an INVALID argument (formal fallacy). Knowing the consequent is true does not guarantee the antecedent caused it."
        }
    ];

    /**
     * Question Generator
     */
    class ChallengeEngine {
        constructor() {
            this.score = 0;
            this.streak = 0;
            this.questionsAnswered = 0;
            this.correctCount = 0;
            this.currentQuestion = null;
        }

        getCurrentLevel() {
            for (let i = LEVELS.length - 1; i >= 0; i--) {
                if (this.score >= LEVELS[i].minScore) {
                    return LEVELS[i];
                }
            }
            return LEVELS[0];
        }

        getNextLevel() {
            const current = this.getCurrentLevel();
            const nextIdx = LEVELS.findIndex(l => l.level === current.level) + 1;
            return nextIdx < LEVELS.length ? LEVELS[nextIdx] : null;
        }

        generateQuestion() {
            // Pick category: 0: Classification, 1: Equivalence, 2: Inference, 3: Truth Evaluation
            const types = ['classification', 'equivalence', 'inference', 'evaluation'];
            const chosenType = types[Math.floor(Math.random() * types.length)];

            let q = null;
            if (chosenType === 'classification') {
                q = this.generateClassificationQuestion();
            } else if (chosenType === 'equivalence') {
                q = this.generateEquivalenceQuestion();
            } else if (chosenType === 'inference') {
                q = this.generateInferenceQuestion();
            } else {
                q = this.generateEvaluationQuestion();
            }

            this.currentQuestion = q;
            return q;
        }

        generateClassificationQuestion() {
            const item = CLASSIFICATION_POOL[Math.floor(Math.random() * CLASSIFICATION_POOL.length)];
            return {
                category: "Expression Classification",
                prompt: `Classify the propositional formula:`,
                formulaDisplay: item.expr,
                questionText: `Determine whether this expression is a Tautology, Contradiction, or Contingency.`,
                options: ["Tautology", "Contradiction", "Contingency"],
                correctAnswer: item.type,
                explanation: item.explanation,
                hint: `Recall: Tautology is True in all rows, Contradiction is False in all rows, and Contingency has mixed values.`
            };
        }

        generateEquivalenceQuestion() {
            const item = EQUIVALENCE_POOL[Math.floor(Math.random() * EQUIVALENCE_POOL.length)];
            return {
                category: "Logical Equivalence",
                prompt: `Are the following two propositional expressions logically equivalent?`,
                formulaDisplay: `Expression 1: ${item.a}\nExpression 2: ${item.b}`,
                questionText: `Do Expression 1 and Expression 2 produce identical truth columns?`,
                options: ["Logically Equivalent (≡)", "Not Equivalent (≢)"],
                correctAnswer: item.isEq ? "Logically Equivalent (≡)" : "Not Equivalent (≢)",
                explanation: `${item.law}: ${item.note}`,
                hint: `Test with truth values (e.g., P=T, Q=F) or remember standard Discrete Math equivalence laws.`
            };
        }

        generateInferenceQuestion() {
            const item = INFERENCE_POOL[Math.floor(Math.random() * INFERENCE_POOL.length)];
            return {
                category: "Inference Rule Identification",
                prompt: `Identify the deductive rule of inference applied:`,
                formulaDisplay: `${item.premises.join('\n')}\n────────────\n∴ ${item.conclusion}`,
                questionText: `Which formal rule or fallacy characterizes this argument?`,
                options: [...item.options].sort(() => Math.random() - 0.5),
                correctAnswer: item.rule,
                explanation: item.explanation,
                hint: `Look at the structure of the premises and what has been detached or cancelled.`
            };
        }

        generateEvaluationQuestion() {
            // Generate evaluation: e.g. P = True, Q = False
            const varP = Math.random() > 0.5;
            const varQ = Math.random() > 0.5;
            const exprs = [
                { formula: "(P → Q) ∧ P", eval: (p, q) => (!p || q) && p },
                { formula: "¬P ∨ (P ∧ Q)", eval: (p, q) => !p || (p && q) },
                { formula: "(P ∨ Q) → ¬P", eval: (p, q) => !(p || q) || !p },
                { formula: "P ↔ (P ∧ Q)", eval: (p, q) => p === (p && q) }
            ];
            const chosen = exprs[Math.floor(Math.random() * exprs.length)];
            const answerBool = chosen.eval(varP, varQ);

            return {
                category: "Truth Value Evaluation",
                prompt: `Evaluate the expression under the given interpretation:`,
                formulaDisplay: `${chosen.formula}\n\nGiven truth assignments: P = ${varP ? 'TRUE' : 'FALSE'}, Q = ${varQ ? 'TRUE' : 'FALSE'}`,
                questionText: `What is the resulting truth value?`,
                options: ["TRUE (T)", "FALSE (F)"],
                correctAnswer: answerBool ? "TRUE (T)" : "FALSE (F)",
                explanation: `Substituting P = ${varP ? 'T' : 'F'} and Q = ${varQ ? 'T' : 'F'} into "${chosen.formula}" yields ${answerBool ? 'TRUE' : 'FALSE'}.`,
                hint: `Evaluate subexpressions inside parentheses first using standard truth tables.`
            };
        }

        submitAnswer(userAnswer, timeRemaining = 0) {
            if (!this.currentQuestion) throw new Error("No active question.");

            const isCorrect = (userAnswer === this.currentQuestion.correctAnswer);
            this.questionsAnswered++;

            let pointsEarned = 0;
            let streakMultiplier = 1.0;

            if (isCorrect) {
                this.streak++;
                this.correctCount++;

                // Streak multiplier
                if (this.streak >= 5) streakMultiplier = 2.5;
                else if (this.streak >= 3) streakMultiplier = 2.0;
                else if (this.streak >= 2) streakMultiplier = 1.5;

                // Base points: 100 + time bonus (10 pts per remaining sec)
                const basePoints = 100;
                const timeBonus = Math.max(0, Math.floor(timeRemaining * 5));
                pointsEarned = Math.round((basePoints + timeBonus) * streakMultiplier);

                this.score += pointsEarned;
            } else {
                this.streak = 0;
            }

            const currentLevel = this.getCurrentLevel();
            const nextLevel = this.getNextLevel();

            return {
                isCorrect,
                userAnswer,
                correctAnswer: this.currentQuestion.correctAnswer,
                pointsEarned,
                totalScore: this.score,
                streak: this.streak,
                streakMultiplier,
                explanation: this.currentQuestion.explanation,
                level: currentLevel,
                nextLevel,
                progressToNext: nextLevel ? Math.min(100, Math.round(((this.score - currentLevel.minScore) / (nextLevel.minScore - currentLevel.minScore)) * 100)) : 100
            };
        }

        reset() {
            this.score = 0;
            this.streak = 0;
            this.questionsAnswered = 0;
            this.correctCount = 0;
            this.currentQuestion = null;
        }
    }

    return {
        LEVELS,
        ChallengeEngine
    };
}));

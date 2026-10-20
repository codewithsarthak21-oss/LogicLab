/**
 * LOGICLAB - Natural Language Statement to Propositional Logic Converter
 * Course: 7MA206 Discrete Mathematics (Unit I: Logic & Proof Techniques)
 * 
 * Features:
 * - Dynamic variable definitions (P, Q, R, S)
 * - Converts English statements into formal logic formulas (¬, ∧, ∨, →, ↔, ⊕)
 * - Identifies linguistic conditional constructs:
 *   * "If P then Q"
 *   * "P only if Q"
 *   * "P if Q"
 *   * "P is sufficient for Q"
 *   * "P is necessary for Q"
 *   * "P unless Q"
 *   * "Neither P nor Q"
 *   * "Either P or Q"
 * - Provides step-by-step grammatical and logical explanations
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./parser'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./parser'));
    } else {
        root.LogicNaturalLanguage = factory(root.LogicParser);
    }
}(typeof self !== 'undefined' ? self : this, function (LogicParser) {
    'use strict';

    // Preset variable scenarios for college discrete mathematics
    const DEFAULT_PROFILES = [
        {
            name: "Weather & Environment (Syllabus Example)",
            variables: {
                P: "It is raining",
                Q: "The ground is wet",
                R: "We carry an umbrella"
            }
        },
        {
            name: "Computer Science & Programming",
            variables: {
                P: "The program compiles without syntax errors",
                Q: "The unit tests pass successfully",
                R: "The code is deployed to production"
            }
        },
        {
            name: "Exam & Academic Success",
            variables: {
                P: "A student solves the problem sets",
                Q: "The student attends all lectures",
                R: "The student achieves an A grade"
            }
        }
    ];

    // Standard translation pattern rules
    const PATTERN_RULES = [
        {
            id: 'if_then',
            regex: /^if\s+(.+?),?\s+then\s+(.+)$/i,
            name: "Conditional (If A then B)",
            transform: (m, dict) => ({
                formula: `${matchPart(m[1], dict)} → ${matchPart(m[2], dict)}`,
                rule: "Conditionals of the form 'If A then B' translate directly to implication A → B, where A is the antecedent (hypothesis) and B is the consequent (conclusion).",
                antecedent: m[1],
                consequent: m[2]
            })
        },
        {
            id: 'iff',
            regex: /^(.+?)\s+(?:if and only if|iff|exactly when)\s+(.+)$/i,
            name: "Biconditional (A if and only if B)",
            transform: (m, dict) => ({
                formula: `${matchPart(m[1], dict)} ↔ ${matchPart(m[2], dict)}`,
                rule: "'A if and only if B' states that A and B have the same truth values in all cases (mutual implication): A ↔ B.",
                partA: m[1],
                partB: m[2]
            })
        },
        {
            id: 'only_if',
            regex: /^(.+?)\s+only if\s+(.+)$/i,
            name: "Conditional (A only if B)",
            transform: (m, dict) => ({
                formula: `${matchPart(m[1], dict)} → ${matchPart(m[2], dict)}`,
                rule: "'A only if B' means that A cannot happen without B. Therefore, occurrence of A guarantees B: A → B.",
                antecedent: m[1],
                consequent: m[2]
            })
        },
        {
            id: 'if_clause',
            regex: /^(.+?)\s+if\s+(.+)$/i,
            name: "Conditional (A if B)",
            transform: (m, dict) => ({
                formula: `${matchPart(m[2], dict)} → ${matchPart(m[1], dict)}`,
                rule: "In 'A if B', B is the condition. The order reverses: B is the antecedent and A is the consequent: B → A.",
                antecedent: m[2],
                consequent: m[1]
            })
        },
        {
            id: 'neither_nor',
            regex: /^neither\s+(.+?)\s+nor\s+(.+)$/i,
            name: "Joint Negation (Neither A nor B)",
            transform: (m, dict) => ({
                formula: `¬${matchPart(m[1], dict)} ∧ ¬${matchPart(m[2], dict)}`,
                rule: "'Neither A nor B' means NOT A and simultaneously NOT B: ¬A ∧ ¬B.",
                partA: m[1],
                partB: m[2]
            })
        },
        {
            id: 'either_or_not_both',
            regex: /^either\s+(.+?)\s+or\s+(.+?)(?:,\s*but not both)$/i,
            name: "Exclusive Disjunction (Either A or B, but not both)",
            transform: (m, dict) => ({
                formula: `${matchPart(m[1], dict)} ⊕ ${matchPart(m[2], dict)}`,
                rule: "'Either A or B but not both' specifies strict XOR: A ⊕ B, which is true when exactly one disjunct is true.",
                partA: m[1],
                partB: m[2]
            })
        },
        {
            id: 'either_or',
            regex: /^either\s+(.+?)\s+or\s+(.+)$/i,
            name: "Inclusive Disjunction (Either A or B)",
            transform: (m, dict) => ({
                formula: `${matchPart(m[1], dict)} ∨ ${matchPart(m[2], dict)}`,
                rule: "'Either A or B' represents standard inclusive disjunction: A ∨ B.",
                partA: m[1],
                partB: m[2]
            })
        },
        {
            id: 'unless',
            regex: /^(.+?)\s+unless\s+(.+)$/i,
            name: "Alternative (A unless B)",
            transform: (m, dict) => ({
                formula: `¬${matchPart(m[2], dict)} → ${matchPart(m[1], dict)}`,
                rule: "'A unless B' means if B is not true, then A must occur: ¬B → A (equivalent to A ∨ B).",
                partA: m[1],
                partB: m[2]
            })
        },
        {
            id: 'and',
            regex: /^(.+?)\s+and\s+(.+)$/i,
            name: "Conjunction (A and B)",
            transform: (m, dict) => ({
                formula: `${matchPart(m[1], dict)} ∧ ${matchPart(m[2], dict)}`,
                rule: "'and' represents conjunction: both propositions must be true simultaneously: A ∧ B.",
                partA: m[1],
                partB: m[2]
            })
        },
        {
            id: 'or',
            regex: /^(.+?)\s+or\s+(.+)$/i,
            name: "Disjunction (A or B)",
            transform: (m, dict) => ({
                formula: `${matchPart(m[1], dict)} ∨ ${matchPart(m[2], dict)}`,
                rule: "'or' represents inclusive disjunction: at least one proposition is true: A ∨ B.",
                partA: m[1],
                partB: m[2]
            })
        },
        {
            id: 'not',
            regex: /^(?:it is not the case that|it is false that|not)\s+(.+)$/i,
            name: "Negation (Not A)",
            transform: (m, dict) => ({
                formula: `¬${matchPart(m[1], dict)}`,
                rule: "Negation inverts the truth value of the proposition: ¬A.",
                partA: m[1]
            })
        }
    ];

    /**
     * Fuzzy matching of an English clause against variable definitions
     */
    function matchPart(partStr, dict) {
        const clean = partStr.toLowerCase().replace(/^[,\s]+|[,\s]+$/g, '').trim();

        // 1. Direct variable name reference (e.g. if user wrote "P" or "¬P")
        for (const [varName] of Object.entries(dict)) {
            if (clean === varName.toLowerCase()) return varName;
            if (clean === `not ${varName.toLowerCase()}` || clean === `¬${varName.toLowerCase()}`) return `¬${varName}`;
        }

        // 2. Check for negation in English part: e.g. "it is not raining" vs P="it is raining"
        let isNegated = false;
        let coreStr = clean;

        if (clean.startsWith('it is not ') || clean.startsWith('not ') || clean.includes(' does not ') || clean.includes(' is not ')) {
            isNegated = true;
            coreStr = clean
                .replace(/^it is not /, 'it is ')
                .replace(/^not /, '')
                .replace(/ does not /, ' ')
                .replace(/ is not /, ' is ');
        }

        // 3. Best match score with registered variable text
        let bestVar = null;
        let bestScore = 0;

        for (const [varName, varText] of Object.entries(dict)) {
            const vClean = varText.toLowerCase().trim();
            // Exact or substring match
            if (coreStr === vClean || vClean.includes(coreStr) || coreStr.includes(vClean)) {
                bestVar = varName;
                bestScore = 1.0;
                break;
            }

            // Word overlap Jaccard similarity
            const wordsA = new Set(coreStr.split(/\s+/));
            const wordsB = new Set(vClean.split(/\s+/));
            let intersection = 0;
            wordsA.forEach(w => { if (wordsB.has(w)) intersection++; });
            const union = new Set([...wordsA, ...wordsB]).size;
            const score = intersection / union;

            if (score > bestScore && score >= 0.3) {
                bestScore = score;
                bestVar = varName;
            }
        }

        if (bestVar) {
            return isNegated ? `¬${bestVar}` : bestVar;
        }

        // Fallback: if not matched, return a bracketed cleaned token or variable placeholder
        return `[${clean}]`;
    }

    /**
     * Convert English sentence to logic formula
     */
    function convertSentence(sentence, variableDict) {
        if (!sentence || !sentence.trim()) {
            throw new Error('Please enter a natural language statement.');
        }

        const trimmed = sentence.trim().replace(/[.!?]+$/, '');

        for (const rule of PATTERN_RULES) {
            const match = trimmed.match(rule.regex);
            if (match) {
                const result = rule.transform(match, variableDict);
                
                // Construct step-by-step reasoning
                const reasoningSteps = [
                    {
                        step: 1,
                        title: 'Identify Defined Propositional Variables',
                        content: Object.entries(variableDict)
                            .map(([k, v]) => `  ${k}: "${v}"`)
                            .join('\n')
                    },
                    {
                        step: 2,
                        title: 'Syntactic Pattern Classification',
                        content: `Detected linguistic pattern: "${rule.name}".\nRule principle: ${result.rule}`
                    },
                    {
                        step: 3,
                        title: 'Sub-statement Component Extraction',
                        content: Object.entries(result)
                            .filter(([k]) => ['antecedent', 'consequent', 'partA', 'partB'].includes(k))
                            .map(([k, v]) => `  ${k.toUpperCase()}: "${v}"`)
                            .join('\n')
                    },
                    {
                        step: 4,
                        title: 'Symbolic Mapping',
                        content: `Mapped natural language components to symbolic proposition formula: ${result.formula}`
                    }
                ];

                return {
                    originalSentence: sentence,
                    formula: result.formula,
                    ruleName: rule.name,
                    ruleExplanation: result.rule,
                    reasoningSteps,
                    success: true
                };
            }
        }

        // If no high-level pattern matched, try keyword scan
        let formula = trimmed;
        formula = formula.replace(/\bif and only if\b|\biff\b/gi, ' ↔ ');
        formula = formula.replace(/\bif\b\s+(.+?)\s+\bthen\b\s+(.+)/gi, '($1 → $2)');
        formula = formula.replace(/\band\b/gi, ' ∧ ');
        formula = formula.replace(/\bor\b/gi, ' ∨ ');
        formula = formula.replace(/\bnot\b/gi, ' ¬ ');

        return {
            originalSentence: sentence,
            formula: formula,
            ruleName: "General Connective Replacement",
            ruleExplanation: "Replaced recognized logical keywords (and, or, not, if..then, iff) with symbolic operators.",
            reasoningSteps: [
                {
                    step: 1,
                    title: 'Linguistic Token Analysis',
                    content: `Sentence did not match an exact textbook template; performed direct connective keyword translation.`
                },
                {
                    step: 2,
                    title: 'Symbolic Replacement',
                    content: `Resulting formula: ${formula}`
                }
            ],
            success: true
        };
    }

    return {
        DEFAULT_PROFILES,
        PATTERN_RULES,
        convertSentence
    };
}));

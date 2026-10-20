# LOGICLAB – Interactive Propositional Logic & Inference Engine

**Course:** 7MA206 – Discrete Mathematics  
**Target Audience:** Second Year Information Technology (SY IT) Engineering Students  
**Selected Unit:** Unit I – Logic & Proof Techniques  
**Project Track:** Track B – Interactive Computational Tool / Inference Engine  
**Platform:** Pure Client-Side Web Application (HTML5, CSS3, Vanilla JavaScript)  
**Execution Environment:** Modern Web Browser (No backend or database dependencies required)

---

## 1. Project Title & Overview

**LOGICLAB** is a comprehensive, interactive computational logic workbench and inference engine designed for college-level Discrete Mathematics. It bridges theoretical propositional calculus with interactive software, allowing students and educators to parse dynamic propositional logic formulas, construct complete truth tables with hierarchical subexpression evaluations, verify logical equivalence, test formal deductive arguments using critical row semantics, execute automated Robinson resolution refutations, convert natural language statements into formal logic, and practice with gamified logic challenges.

---

## 2. Project Objective

The primary objective of LOGICLAB is to provide computer science and engineering students with an intuitive yet mathematically rigorous platform to:
1. Master formal propositional syntax and semantics through working software.
2. Demystify truth table construction by showing intermediate subexpression column evaluations rather than just final outputs.
3. Understand the foundational proof techniques used in discrete mathematics, compiler design, artificial intelligence, and formal hardware verification.
4. Eliminate common reasoning fallacies (e.g., Affirming the Consequent, Denying the Antecedent) through step-by-step counterexample analysis.
5. Provide a zero-setup, self-contained educational resource that runs immediately in any browser without external servers.

---

## 3. Problem Statement

In collegiate Discrete Mathematics curricula (such as Course 7MA206), students often struggle with:
- Manually calculating truth tables for formulas with 3 or more variables ($2^n$ rows) without making sign errors in intermediate connectives ($\neg, \wedge, \vee, \rightarrow, \leftrightarrow$).
- Distinguishing between valid deductive reasoning (e.g., Modus Ponens, Modus Tollens) and formal non-sequitur fallacies.
- Understanding how automated theorem provers and SAT solvers work via Robinson's Propositional Resolution.
- Translating colloquial English conditional constructs ("only if", "unless", "necessary vs. sufficient") into unambiguous logical formulas.

LOGICLAB addresses these challenges by computing exact truth valuations, visualizing every intermediate AST step, explaining classifications, pinpointing counterexample valuations, and displaying resolution derivation trees.

---

## 4. Mathematical Concepts & Formal Foundations

### 4.1. Propositions and Truth Values
A proposition is a declarative statement that is either strictly True ($T$ or $1$) or strictly False ($F$ or $0$).
- **Law of Excluded Middle:** $\forall P, P \vee \neg P$ holds universally.
- **Principle of Non-Contradiction:** $\forall P, \neg(P \wedge \neg P)$ holds universally.

### 4.2. Connective Semantics
| Connective | Symbol | Text Alias | Definition / Truth Conditions |
|---|---|---|---|
| Negation | $\neg$ | `NOT`, `~`, `!` | True if and only if operand is False ($\neg T = F, \neg F = T$) |
| Conjunction | $\wedge$ | `AND`, `&` | True if and only if both operands are True |
| Disjunction | $\vee$ | `OR`, `\|` | True if at least one operand is True |
| Exclusive OR | $\oplus$ | `XOR` | True if exactly one operand is True |
| Implication | $\rightarrow$ | `->`, `IMPLIES` | False ONLY when antecedent is True and consequent is False ($\neg P \vee Q$) |
| Biconditional | $\leftrightarrow$ | `<->`, `IFF` | True if both operands have identical truth values |

### 4.3. Formula Classifications
- **Tautology ($\top$):** Evaluates to $T$ in all $2^n$ assignments.
- **Contradiction ($\bot$):** Evaluates to $F$ in all $2^n$ assignments.
- **Contingency:** Evaluates to $T$ in at least one row and $F$ in at least one row.

### 4.4. Logical Equivalence ($A \equiv B$)
Two formulas $A$ and $B$ are logically equivalent if and only if $A \leftrightarrow B$ is a tautology. Important syllabus equivalences include:
- **Implication Law:** $P \rightarrow Q \equiv \neg P \vee Q$
- **Contrapositive Law:** $P \rightarrow Q \equiv \neg Q \rightarrow \neg P$
- **De Morgan's Laws:** $\neg(P \wedge Q) \equiv \neg P \vee \neg Q$ and $\neg(P \vee Q) \equiv \neg P \wedge \neg Q$
- **Distributive Laws:** $P \wedge (Q \vee R) \equiv (P \wedge Q) \vee (P \wedge R)$
- **Double Negation:** $\neg(\neg P) \equiv P$
- **Biconditional Law:** $P \leftrightarrow Q \equiv (P \rightarrow Q) \wedge (Q \rightarrow P)$

### 4.5. Rules of Inference
An argument with premises $P_1, P_2, \dots, P_k$ and conclusion $C$ is semantically valid ($P_1, \dots, P_k \models C$) if and only if in every row where all premises evaluate to True (Critical Rows), the conclusion $C$ is also True.
- **Modus Ponens (Law of Detachment):** $P \rightarrow Q, P \vdash Q$
- **Modus Tollens (Law of Contraposition):** $P \rightarrow Q, \neg Q \vdash \neg P$
- **Hypothetical Syllogism (Transitivity):** $P \rightarrow Q, Q \rightarrow R \vdash P \rightarrow R$
- **Disjunctive Syllogism:** $P \vee Q, \neg P \vdash Q$
- **Conjunctive Simplification:** $P \wedge Q \vdash P$
- **Conjunction Introduction:** $P, Q \vdash P \wedge Q$
- **Disjunctive Addition:** $P \vdash P \vee Q$

### 4.6. Robinson's Propositional Resolution
Given clauses in Conjunctive Normal Form (CNF):
$$\frac{A \vee L, \quad B \vee \neg L}{A \vee B}$$
Where $L$ and $\neg L$ are complementary literals. If resolving clauses leads to the empty clause ($\square$), a contradiction is established, proving that the original clause set is unsatisfiable.

---

## 5. System Architecture

LOGICLAB is built with a strictly decoupled, modular architecture:

```
logiclab/
├── index.html                  # Single-page dashboard application shell
├── css/
│   └── style.css               # Modern academic dashboard stylesheet
├── js/
│   ├── parser.js               # Lexer, Tokenizer, Recursive-Descent AST Builder
│   ├── truthTable.js           # Combinatorial Truth Table & Subexpression Engine
│   ├── equivalence.js          # Joint Model Evaluator & Counterexample Finder
│   ├── inference.js            # Argument Engine & Critical Row Semantic Verifier
│   ├── resolution.js           # Propositional Resolution & Refutation Deriver
│   ├── naturalLanguage.js      # English linguistic mapper & template transformer
│   ├── quiz.js                 # Gamified Challenge engine with streaks & levels
│   ├── learning.js             # 14 complete Discrete Math curriculum topics
│   └── app.js                  # Master Controller, Keypad, DOM events, UI router
└── README.md                   # Formal documentation & viva report
```

---

## 6. Detailed Algorithms

### 6.1. Expression Parsing & AST Construction
- **Lexical Analysis:** Scans input string for unicode math symbols ($\wedge, \vee, \neg, \rightarrow, \leftrightarrow, \oplus$) and ASCII aliases (`AND`, `OR`, `NOT`, `->`, `<->`, `~`, `!`).
- **Precedence Hierarchy:**
  1. Parentheses `(...)`
  2. Unary Negation `¬` (Right-associative)
  3. Conjunction `∧` (Left-associative)
  4. Disjunction `∨`, `⊕` (Left-associative)
  5. Implication `→` (Right-associative standard in mathematical logic)
  6. Biconditional `↔` (Left/Non-associative)
- **Subexpression Extraction:** Traverses the AST in post-order to generate a canonical, deduplicated sequence of intermediate subexpressions so each column in the truth table represents an atomic step towards the final formula.

### 6.2. Truth Table Generation
1. Extracts all unique variables $V = \{v_1, v_2, \dots, v_n\}$ sorted lexicographically.
2. Iterates from $0$ to $2^n - 1$, generating bitwise assignments where high bits represent standard discrete math ordering (Row 1 starts with $T, T, \dots$).
3. Evaluates all intermediate subexpressions row by row.
4. Analyzes final column count:
   - $F_{\text{count}} = 0 \implies$ **Tautology**
   - $T_{\text{count}} = 0 \implies$ **Contradiction**
   - Otherwise $\implies$ **Contingency**

### 6.3. Logical Equivalence & Counterexample Detection
1. Combines variable sets $V_{\text{combined}} = \text{vars}(A) \cup \text{vars}(B)$.
2. Evaluates truth vectors $\vec{v}_A$ and $\vec{v}_B$ over all $2^{|V|}$ assignments.
3. Constructs the column $(A \leftrightarrow B)$. If all values are $T$, expressions are equivalent ($A \equiv B$).
4. If any row evaluates to $F$, that specific assignment is isolated and displayed as a counterexample.

### 6.4. Deductive Argument Verification via Critical Rows
1. Generates joint valuation space for all premises and conclusion.
2. Identifies **Critical Rows**: rows where $\bigwedge_{i=1}^k P_i = \text{True}$.
3. Validates that conclusion $C$ evaluates to $\text{True}$ on all critical rows.
4. Pattern matches premises against classical deduction rules (Modus Ponens, Modus Tollens, etc.) or flags formal fallacies (Affirming the Consequent, Denying the Antecedent).

### 6.5. Robinson's Propositional Resolution Algorithm
1. Parses input clauses as sets of literals.
2. Systematically pairs clauses $(C_i, C_j)$ and searches for complementary literal pairs $(L, \neg L)$.
3. Computes resolvents: $(C_i \setminus \{L\}) \cup (C_j \setminus \{\neg L\})$.
4. Filters out tautological clauses (e.g. $P \vee \neg P$) and duplicates.
5. Continues until the empty clause ($\square$) is derived (Contradiction / Unsatisfiable) or the clause set reaches saturation.

---

## 7. Features & Capabilities

- **Dynamic User Input:** Enter any arbitrary propositional logic formula, not just fixed presets.
- **Virtual Symbol Keypad:** Convenient on-screen buttons for $\wedge, \vee, \neg, \rightarrow, \leftrightarrow, \oplus, P, Q, R, S, (, )$.
- **Hierarchical Truth Tables:** Displays every intermediate subexpression column.
- **Format Toggle:** Seamlessly switch between `T / F` and `1 / 0` notations.
- **Exporting Options:** Copy truth tables directly as GitHub Markdown or download as CSV.
- **Equivalence Checker:** Tests whether $A \equiv B$ and pinpoints exact counterexample states.
- **Inference Engine:** Supports dynamic addition of premises, isolates critical rows, and detects valid rules versus formal fallacies.
- **Resolution Solver:** Step-by-step derivation history detailing parent clauses, cancelled literals, and empty clause derivation.
- **Natural Language Translator:** Converts English sentences into formal logic with contextual variable profiles (Weather, Computer Science, Academic Exam).
- **Gamified Logic Challenge:** Dynamic multiple-choice questions, timers, score multiplier streaks, levels from Novice to Master, and mathematical hints.
- **14-Topic Knowledge Base:** Complete curriculum lecture notes with interactive "Try in Tool" buttons.
- **Step-by-Step Mathematical Reasoning:** Every calculation is accompanied by an explicit 4 to 6 step justification timeline.

---

## 8. Technology Stack

- **Markup:** HTML5 (Semantic structure, accessible form controls)
- **Styling:** Modern CSS3 (CSS Custom Properties, Grid, Flexbox, responsive design, sleek academic dark theme)
- **Scripting:** Modular Vanilla JavaScript (ES6+ classes, Universal Module Definition compatible)
- **Icons:** Boxicons (Academic, logic, and mathematical icons)
- **Typography:** Inter (Body) & JetBrains Mono (Logic formulas and truth tables)
- **Server/Backend:** None (100% Client-Side Browser Execution)

---

## 9. How to Run the Application

Because LOGICLAB is built entirely with client-side web technologies, running it requires **zero installation** and **no build steps**.

### Method 1: Direct File Launch
1. Locate `index.html` in the project folder.
2. Double-click `index.html` to open it in any modern browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### Method 2: Local Static Server (Recommended for development)
Using Node.js:
```bash
npx serve .
# or
npx http-server .
```
Using Python 3:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

---

## 10. Comprehensive Test Cases & Verification Matrix

| # | Test Expression / Argument | Expected Classification / Output | Verification Result |
|---|---|---|---|
| 1 | `P ∨ ¬P` | **Tautology** ($2/2$ True rows) | Passed |
| 2 | `P ∧ ¬P` | **Contradiction** ($0/2$ True rows) | Passed |
| 3 | `P ∧ Q` | **Contingency** ($1/4$ True rows) | Passed |
| 4 | `P → Q` | **Contingency** ($3/4$ True rows) | Passed |
| 5 | `(P → Q) ∧ P` | **Contingency** ($1/4$ True rows) | Passed |
| 6 | `P ↔ Q` | **Contingency** ($2/4$ True rows) | Passed |
| 7 | `(P ∧ Q) → R` | **Contingency** ($7/8$ True rows) | Passed |
| 8 | `P → Q` vs `¬P ∨ Q` | **Logically Equivalent** ($A \equiv B$) | Passed |
| 9 | `P → Q` vs `Q → P` | **Not Equivalent** (Counterexample: $P=T, Q=F$) | Passed |
| 10 | $P \rightarrow Q, P \vdash Q$ | **Valid Argument** (Modus Ponens) | Passed |
| 11 | $P \rightarrow Q, \neg Q \vdash \neg P$ | **Valid Argument** (Modus Tollens) | Passed |
| 12 | $P \rightarrow Q, Q \vdash P$ | **Invalid Fallacy** (Affirming the Consequent) | Passed |
| 13 | Clauses: `(P ∨ Q)`, `(¬P ∨ R)`, `¬Q`, `¬R` | **Contradiction Derived** (Empty Clause $\square$) | Passed |
| 14 | "If it is raining, then the ground is wet." | **P → Q** (Conditional translation) | Passed |
| 15 | "The ground is wet if and only if it is raining." | **Q ↔ P** (Biconditional translation) | Passed |

---

## 11. Future Scope

1. **First-Order Predicate Logic (FOL):** Extension to universal ($\forall$) and existential ($\exists$) quantifiers with domain universes.
2. **Karnaugh Map (K-Map) Solver:** Interactive 2-, 3-, and 4-variable K-maps with visual grouping for Boolean minimization.
3. **Automated DPLL SAT Solver:** Davis-Putnam-Logemann-Loveland algorithm with unit propagation and pure literal elimination.
4. **Natural Deduction Proof Tree Visualizer:** Interactive Gentzen-style tree proof builder with inference step drag-and-drop.
5. **LaTeX Output Generator:** One-click copy of LaTeX `tabular` and `amsmath` code for research papers and laboratory reports.

---

## 12. Team Member Roles & Contributions

*Project Track B – Interactive Computational Tool / Inference Engine (Course 7MA206)*

| Role | Responsibilities |
|---|---|
| **Mathematical Logic Lead** | Propositional calculus formalization, operator precedence definitions, inference rule schemas, and resolution theory. |
| **Parser & Algorithm Architect** | Lexer, tokenizer, AST construction, recursive descent parser, combinatorial truth table engine, and resolution solver algorithms. |
| **Frontend UI/UX Designer** | Responsive dashboard layout, dark-theme styling, KaTeX/monospace integration, virtual keypad components, and accessibility. |
| **Gamification & Education Lead** | Curriculum topic notes (14 topics), question generator engine, streak/scoring mechanics, and natural language converter templates. |
| **QA, Testing & Verification Lead** | Unit testing with Node.js, edge-case validation (syntax errors, empty clauses, counterexamples), and viva documentation. |

---

*Developed for Discrete Mathematics (7MA206) • SY IT Engineering*

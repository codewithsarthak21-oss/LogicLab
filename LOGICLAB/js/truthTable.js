/**
 * LOGICLAB - Truth Table Generator & Expression Classifier
 * Course: 7MA206 Discrete Mathematics (Unit I: Logic & Proof Techniques)
 * 
 * Features:
 * - Generates all 2^n row truth tables for n variables
 * - Computes intermediate subexpression values
 * - Classifies into Tautology, Contradiction, or Contingency
 * - Produces comprehensive step-by-step mathematical reasoning
 * - Exports to Markdown and CSV
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./parser'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./parser'));
    } else {
        root.LogicTruthTable = factory(root.LogicParser);
    }
}(typeof self !== 'undefined' ? self : this, function (LogicParser) {
    'use strict';

    /**
     * Generate all 2^n boolean assignments for a list of variables
     * Standard college convention: Row 0 has T, T, ...; Row 2^n - 1 has F, F, ...
     */
    function generateTruthAssignments(variables) {
        const n = variables.length;
        const totalRows = Math.pow(2, n);
        const assignments = [];

        for (let i = 0; i < totalRows; i++) {
            const row = {};
            for (let j = 0; j < n; j++) {
                // High bit corresponds to first variable, toggling half and half
                const bit = (i >> (n - 1 - j)) & 1;
                // If bit == 0 -> True, if bit == 1 -> False (Standard Discrete Math order: T first)
                row[variables[j]] = (bit === 0);
            }
            assignments.push(row);
        }

        return assignments;
    }

    /**
     * Generate full truth table for an AST or expression string
     */
    function generateTruthTable(input) {
        let ast;
        let originalString = '';

        if (typeof input === 'string') {
            originalString = input;
            ast = LogicParser.parse(input);
        } else {
            ast = input;
            originalString = ast.toString();
        }

        // 1. Detect variables
        const varSet = ast.getVariables();
        const variables = Array.from(varSet).sort();
        const n = variables.length;

        if (n > 8) {
            throw new Error(`Expression contains ${n} variables (${variables.join(', ')}). A truth table would require 2^${n} = ${Math.pow(2, n)} rows, which exceeds the browser safety limit of 8 variables (256 rows).`);
        }

        // 2. Extract intermediate subexpressions
        const rawSubexpressions = ast.collectSubexpressions();
        
        // Filter out subexpressions that are just the single variables
        const subexpressions = [];
        const seenStrings = new Set(variables);

        for (const sub of rawSubexpressions) {
            const s = sub.str;
            if (!seenStrings.has(s)) {
                seenStrings.add(s);
                subexpressions.push(sub);
            }
        }

        // Make sure the root expression is represented
        const rootStr = ast.toString();
        let hasRoot = subexpressions.some(s => s.str === rootStr);
        if (!hasRoot && !variables.includes(rootStr)) {
            subexpressions.push({
                node: ast,
                str: rootStr
            });
        }

        // 3. Generate assignments
        const assignments = generateTruthAssignments(variables);

        // 4. Evaluate each row
        const rows = [];
        let trueCount = 0;
        let falseCount = 0;

        assignments.forEach((assignment, rowIndex) => {
            const varValues = {};
            for (const v of variables) {
                varValues[v] = assignment[v];
            }

            const subValues = {};
            for (const sub of subexpressions) {
                try {
                    subValues[sub.str] = sub.node.evaluate(assignment);
                } catch (e) {
                    subValues[sub.str] = null;
                }
            }

            const finalValue = ast.evaluate(assignment);
            if (finalValue) trueCount++;
            else falseCount++;

            rows.push({
                rowIndex: rowIndex + 1,
                assignment,
                varValues,
                subValues,
                finalValue
            });
        });

        const totalRows = rows.length;

        // 5. Classification
        let classification = '';
        let classificationDescription = '';
        let badgeColor = '';

        if (falseCount === 0) {
            classification = 'Tautology';
            classificationDescription = `All ${totalRows} rows evaluate to TRUE (T). The proposition is universally valid under all interpretations.`;
            badgeColor = 'success';
        } else if (trueCount === 0) {
            classification = 'Contradiction';
            classificationDescription = `All ${totalRows} rows evaluate to FALSE (F). The proposition is unsatisfiable under every interpretation.`;
            badgeColor = 'danger';
        } else {
            classification = 'Contingency';
            classificationDescription = `The proposition evaluates to TRUE in ${trueCount} row${trueCount > 1 ? 's' : ''} and FALSE in ${falseCount} row${falseCount > 1 ? 's' : ''}. Its truth value depends on the assignments of its variables.`;
            badgeColor = 'warning';
        }

        // 6. Generate Step-by-Step Reasoning
        const reasoningSteps = [
            {
                step: 1,
                title: 'Detect Propositional Variables',
                content: `Identified ${n} unique variable${n !== 1 ? 's' : ''}: [${variables.join(', ')}].`
            },
            {
                step: 2,
                title: 'Determine Truth Combinations',
                content: `For ${n} variable${n !== 1 ? 's' : ''}, the truth table requires 2^${n} = ${totalRows} possible truth-value combination rows.`
            },
            {
                step: 3,
                title: 'Decompose Intermediate Subexpressions',
                content: subexpressions.length > 1
                    ? `Decomposed formula into ${subexpressions.length} hierarchical subexpression columns: ${subexpressions.map(s => `"${s.str}"`).join(', ')}.`
                    : `Direct atomic evaluation without compound intermediate subexpressions.`
            },
            {
                step: 4,
                title: 'Evaluate Row-by-Row Values',
                content: `Evaluated truth values across all ${totalRows} rows using formal operator semantics (¬, ∧, ∨, →, ↔).`
            },
            {
                step: 5,
                title: 'Analyze Final Truth Column',
                content: `Final column contains ${trueCount} TRUE (T) and ${falseCount} FALSE (F) outcomes.`
            },
            {
                step: 6,
                title: 'Classify Expression',
                content: `Expression is classified as a ${classification.toUpperCase()}. ${classificationDescription}`
            }
        ];

        return {
            originalString,
            canonicalString: ast.toString(),
            ast,
            variables,
            subexpressions: subexpressions.map(s => s.str),
            rows,
            totalRows,
            trueCount,
            falseCount,
            classification,
            classificationDescription,
            badgeColor,
            reasoningSteps
        };
    }

    /**
     * Export truth table to Markdown format
     */
    function toMarkdown(tableResult, format = 'TF') {
        const { variables, subexpressions, rows } = tableResult;
        const columns = [...variables, ...subexpressions];

        const valToStr = (v) => {
            if (format === '10') return v ? '1' : '0';
            return v ? 'T' : 'F';
        };

        let md = '| ' + columns.join(' | ') + ' |\n';
        md += '| ' + columns.map(() => '---').join(' | ') + ' |\n';

        rows.forEach(r => {
            const rowVals = [];
            for (const v of variables) {
                rowVals.push(valToStr(r.varValues[v]));
            }
            for (const s of subexpressions) {
                rowVals.push(valToStr(r.subValues[s]));
            }
            md += '| ' + rowVals.join(' | ') + ' |\n';
        });

        return md;
    }

    /**
     * Export truth table to CSV format
     */
    function toCSV(tableResult, format = 'TF') {
        const { variables, subexpressions, rows } = tableResult;
        const columns = [...variables, ...subexpressions];

        const valToStr = (v) => {
            if (format === '10') return v ? '1' : '0';
            return v ? 'T' : 'F';
        };

        const escapeCSV = (str) => `"${str.replace(/"/g, '""')}"`;

        let csv = columns.map(escapeCSV).join(',') + '\n';

        rows.forEach(r => {
            const rowVals = [];
            for (const v of variables) {
                rowVals.push(valToStr(r.varValues[v]));
            }
            for (const s of subexpressions) {
                rowVals.push(valToStr(r.subValues[s]));
            }
            csv += rowVals.map(escapeCSV).join(',') + '\n';
        });

        return csv;
    }

    return {
        generateTruthAssignments,
        generateTruthTable,
        toMarkdown,
        toCSV
    };
}));

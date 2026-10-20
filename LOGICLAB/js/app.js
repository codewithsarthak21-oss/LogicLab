/**
 * LOGICLAB - Main Application Controller
 * Course: 7MA206 Discrete Mathematics (Unit I: Logic & Proof Techniques)
 * 
 * Orchestrates:
 * - Tab Navigation & Deep Linking
 * - Virtual Symbol Keypad for fast formula input
 * - Dynamic Presets & History Tracking
 * - Event wiring for Analyzer, Truth Table, Equivalence, Inference, Resolution,
 *   Natural Language, Quiz, and Knowledge Base.
 */

(function () {
    'use strict';

    // Global App State
    const AppState = {
        currentTab: 'dashboard',
        activeInputId: 'analyzer-input',
        tableDisplayMode: 'TF', // 'TF' or '10'
        history: [],
        quizEngine: null,
        quizTimerId: null,
        quizTimeLeft: 30,
        quizIsPaused: false
    };

    // DOM Ready Initialization
    document.addEventListener('DOMContentLoaded', () => {
        initNavigation();
        initVirtualKeypads();
        initDashboard();
        initExpressionAnalyzer();
        initEquivalenceChecker();
        initInferenceEngine();
        initResolutionSolver();
        initNaturalLanguageConverter();
        initLogicChallenge();
        initLearningSection();

        // Load sample into Analyzer on startup
        document.getElementById('analyzer-input').value = '(P → Q) ∧ P';
        runExpressionAnalysis();
    });

    /**
     * Tab Navigation
     */
    function initNavigation() {
        const navItems = document.querySelectorAll('.nav-link, .quick-card-btn, .view-all-btn');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = item.getAttribute('data-tab');
                if (targetTab) {
                    switchTab(targetTab);
                }
            });
        });

        // Mobile menu toggle if available
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar');
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
    }

    function switchTab(tabId) {
        AppState.currentTab = tabId;

        // Update sidebar links
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-tab') === tabId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update tab views
        document.querySelectorAll('.tab-view').forEach(view => {
            if (view.id === `tab-${tabId}`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        // Close mobile sidebar if open
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Virtual Symbol Keypad
     * Inserts mathematical logic symbols at cursor position
     */
    function initVirtualKeypads() {
        // Track last focused input for keypad insertion
        document.addEventListener('focusin', (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.target.classList.contains('logic-input')) {
                AppState.activeInputId = e.target.id;
            }
        });

        // Keypad buttons
        document.querySelectorAll('.keypad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const symbol = btn.getAttribute('data-symbol');
                const targetInputId = btn.closest('.keypad-container')?.getAttribute('data-target') || AppState.activeInputId;
                const input = document.getElementById(targetInputId);
                if (!input) return;

                if (symbol === 'CLEAR') {
                    input.value = '';
                    input.focus();
                } else if (symbol === 'BACKSPACE') {
                    const start = input.selectionStart;
                    const end = input.selectionEnd;
                    if (start > 0 || end > start) {
                        const val = input.value;
                        if (start === end) {
                            input.value = val.substring(0, start - 1) + val.substring(end);
                            input.setSelectionRange(start - 1, start - 1);
                        } else {
                            input.value = val.substring(0, start) + val.substring(end);
                            input.setSelectionRange(start, start);
                        }
                    }
                    input.focus();
                } else {
                    insertAtCursor(input, symbol);
                }
            });
        });
    }

    function insertAtCursor(input, text) {
        const start = input.selectionStart || input.value.length;
        const end = input.selectionEnd || input.value.length;
        const oldVal = input.value;
        const needsSpace = text !== '(' && text !== ')' && text !== '¬';
        const formatted = needsSpace ? ` ${text} ` : text;

        input.value = oldVal.substring(0, start) + formatted + oldVal.substring(end);
        const newPos = start + formatted.length;
        input.setSelectionRange(newPos, newPos);
        input.focus();
    }

    /**
     * History & Audit Logger
     */
    function logActivity(toolName, formula, resultBadge) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = { toolName, formula, resultBadge, timestamp };
        AppState.history.unshift(entry);
        if (AppState.history.length > 10) AppState.history.pop();
        updateDashboardHistory();
    }

    function updateDashboardHistory() {
        const list = document.getElementById('recent-activity-list');
        if (!list) return;

        if (AppState.history.length === 0) {
            list.innerHTML = `<li class="empty-state">No operations performed yet. Try evaluating an expression!</li>`;
            return;
        }

        list.innerHTML = AppState.history.map(item => `
            <li class="activity-item">
                <div class="activity-meta">
                    <span class="tool-tag">${escapeHtml(item.toolName)}</span>
                    <span class="activity-time">${item.timestamp}</span>
                </div>
                <div class="activity-expr"><code>${escapeHtml(item.formula)}</code></div>
                <div class="activity-result">${item.resultBadge}</div>
            </li>
        `).join('');
    }

    /**
     * Dashboard View
     */
    function initDashboard() {
        updateDashboardHistory();
    }

    /**
     * FEATURE 1 & 2 & 3: EXPRESSION ANALYZER & TRUTH TABLE GENERATOR
     */
    function initExpressionAnalyzer() {
        const analyzeBtn = document.getElementById('analyze-btn');
        const input = document.getElementById('analyzer-input');
        const clearBtn = document.getElementById('analyzer-clear-btn');
        const presetSelect = document.getElementById('analyzer-presets');
        const copyMarkdownBtn = document.getElementById('copy-markdown-btn');
        const copyCSVBtn = document.getElementById('copy-csv-btn');
        const formatToggleBtn = document.getElementById('format-toggle-btn');

        if (analyzeBtn && input) {
            analyzeBtn.addEventListener('click', () => runExpressionAnalysis());
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') runExpressionAnalysis();
            });
        }

        if (clearBtn && input) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                document.getElementById('analyzer-results').style.display = 'none';
                input.focus();
            });
        }

        if (presetSelect && input) {
            presetSelect.addEventListener('change', () => {
                if (presetSelect.value) {
                    input.value = presetSelect.value;
                    runExpressionAnalysis();
                }
            });
        }

        // Quick Preset Chips
        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const targetId = chip.getAttribute('data-target');
                const expr = chip.getAttribute('data-expr');
                const targetInput = document.getElementById(targetId);
                if (targetInput && expr) {
                    targetInput.value = expr;
                    if (targetId === 'analyzer-input') runExpressionAnalysis();
                }
            });
        });

        // Export Actions
        if (copyMarkdownBtn) {
            copyMarkdownBtn.addEventListener('click', () => {
                if (!window.currentTableResult) return;
                const md = LogicTruthTable.toMarkdown(window.currentTableResult, AppState.tableDisplayMode);
                navigator.clipboard.writeText(md).then(() => showToast('Truth table copied as Markdown!'));
            });
        }

        if (copyCSVBtn) {
            copyCSVBtn.addEventListener('click', () => {
                if (!window.currentTableResult) return;
                const csv = LogicTruthTable.toCSV(window.currentTableResult, AppState.tableDisplayMode);
                navigator.clipboard.writeText(csv).then(() => showToast('Truth table copied as CSV!'));
            });
        }

        if (formatToggleBtn) {
            formatToggleBtn.addEventListener('click', () => {
                AppState.tableDisplayMode = AppState.tableDisplayMode === 'TF' ? '10' : 'TF';
                formatToggleBtn.textContent = AppState.tableDisplayMode === 'TF' ? 'Display: T / F' : 'Display: 1 / 0';
                if (window.currentTableResult) {
                    renderTruthTable(window.currentTableResult);
                }
            });
        }
    }

    function runExpressionAnalysis() {
        const input = document.getElementById('analyzer-input');
        const errorBox = document.getElementById('analyzer-error');
        const resultsContainer = document.getElementById('analyzer-results');

        errorBox.style.display = 'none';
        errorBox.textContent = '';

        const exprText = input.value.trim();
        if (!exprText) {
            showError(errorBox, 'Please enter a valid propositional logic expression.');
            resultsContainer.style.display = 'none';
            return;
        }

        try {
            const tableResult = LogicTruthTable.generateTruthTable(exprText);
            window.currentTableResult = tableResult;

            renderAnalyzerResults(tableResult);
            resultsContainer.style.display = 'block';

            // Log activity
            const badgeHtml = `<span class="badge badge-${tableResult.badgeColor}">${tableResult.classification}</span>`;
            logActivity('Expression Analyzer', tableResult.canonicalString, badgeHtml);

        } catch (err) {
            showError(errorBox, err.message);
            resultsContainer.style.display = 'none';
        }
    }

    function renderAnalyzerResults(res) {
        // 1. Classification Banner
        const classificationCard = document.getElementById('classification-card');
        const classBadge = document.getElementById('classification-badge');
        const classTitle = document.getElementById('classification-title');
        const classDesc = document.getElementById('classification-desc');

        classBadge.className = `badge badge-${res.badgeColor} badge-lg`;
        classBadge.textContent = res.classification.toUpperCase();
        classTitle.textContent = `${res.classification} Form`;
        classDesc.textContent = res.classificationDescription;

        // 2. Metrics summary
        document.getElementById('metric-vars').textContent = res.variables.join(', ') || 'None';
        document.getElementById('metric-rows').textContent = res.totalRows;
        document.getElementById('metric-true').textContent = `${res.trueCount} (${Math.round((res.trueCount / res.totalRows) * 100)}%)`;
        document.getElementById('metric-false').textContent = `${res.falseCount} (${Math.round((res.falseCount / res.totalRows) * 100)}%)`;

        // 3. Step-by-Step Reasoning
        const reasoningContainer = document.getElementById('analyzer-reasoning-steps');
        reasoningContainer.innerHTML = res.reasoningSteps.map(step => `
            <div class="reasoning-step">
                <div class="step-num">Step ${step.step}</div>
                <div class="step-body">
                    <h5>${escapeHtml(step.title)}</h5>
                    <p>${escapeHtml(step.content).replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `).join('');

        // 4. Render Table
        renderTruthTable(res);
    }

    function renderTruthTable(res) {
        const thead = document.getElementById('truth-table-head');
        const tbody = document.getElementById('truth-table-body');
        const isTF = AppState.tableDisplayMode === 'TF';

        const formatVal = (v) => {
            if (isTF) {
                return v ? '<span class="val-t">T</span>' : '<span class="val-f">F</span>';
            }
            return v ? '<span class="val-1">1</span>' : '<span class="val-0">0</span>';
        };

        // Table Header
        let headHtml = '<tr><th class="th-row-num">#</th>';
        res.variables.forEach(v => {
            headHtml += `<th class="th-var">${escapeHtml(v)}</th>`;
        });
        res.subexpressions.forEach((sub, idx) => {
            const isRoot = idx === res.subexpressions.length - 1;
            headHtml += `<th class="${isRoot ? 'th-root' : 'th-sub'}">${escapeHtml(sub)}</th>`;
        });
        headHtml += '</tr>';
        thead.innerHTML = headHtml;

        // Table Rows
        let bodyHtml = '';
        res.rows.forEach(r => {
            const rowClass = r.finalValue ? 'row-true' : 'row-false';
            bodyHtml += `<tr class="${rowClass}">`;
            bodyHtml += `<td class="td-row-num">${r.rowIndex}</td>`;

            res.variables.forEach(v => {
                bodyHtml += `<td class="td-var">${formatVal(r.varValues[v])}</td>`;
            });

            res.subexpressions.forEach((sub, idx) => {
                const isRoot = idx === res.subexpressions.length - 1;
                bodyHtml += `<td class="${isRoot ? 'td-root' : 'td-sub'}">${formatVal(r.subValues[sub])}</td>`;
            });

            bodyHtml += '</tr>';
        });
        tbody.innerHTML = bodyHtml;
    }

    /**
     * FEATURE 4: LOGICAL EQUIVALENCE CHECKER
     */
    function initEquivalenceChecker() {
        const checkBtn = document.getElementById('check-equiv-btn');
        const inputA = document.getElementById('equiv-input-a');
        const inputB = document.getElementById('equiv-input-b');
        const presetSelect = document.getElementById('equiv-presets');
        const swapBtn = document.getElementById('equiv-swap-btn');

        if (checkBtn) {
            checkBtn.addEventListener('click', runEquivalenceCheck);
        }

        if (swapBtn && inputA && inputB) {
            swapBtn.addEventListener('click', () => {
                const temp = inputA.value;
                inputA.value = inputB.value;
                inputB.value = temp;
                runEquivalenceCheck();
            });
        }

        if (presetSelect && inputA && inputB) {
            presetSelect.addEventListener('change', () => {
                const val = presetSelect.value;
                if (val) {
                    const [a, b] = val.split(';;;');
                    inputA.value = a.trim();
                    inputB.value = b.trim();
                    runEquivalenceCheck();
                }
            });
        }

        // Initialize with default
        if (inputA && inputB) {
            inputA.value = 'P → Q';
            inputB.value = '¬P ∨ Q';
        }
    }

    function runEquivalenceCheck() {
        const inputA = document.getElementById('equiv-input-a');
        const inputB = document.getElementById('equiv-input-b');
        const errorBox = document.getElementById('equiv-error');
        const resultsContainer = document.getElementById('equiv-results');

        errorBox.style.display = 'none';
        errorBox.textContent = '';

        const aStr = inputA.value.trim();
        const bStr = inputB.value.trim();

        if (!aStr || !bStr) {
            showError(errorBox, 'Please enter expressions for both Expression A and Expression B.');
            resultsContainer.style.display = 'none';
            return;
        }

        try {
            const res = LogicEquivalence.checkEquivalence(aStr, bStr);
            renderEquivalenceResults(res);
            resultsContainer.style.display = 'block';

            const badgeHtml = res.isEquivalent
                ? `<span class="badge badge-success">Equivalent (≡)</span>`
                : `<span class="badge badge-danger">Not Equivalent (≢)</span>`;
            logActivity('Equivalence Checker', `${res.exprA} vs ${res.exprB}`, badgeHtml);

        } catch (err) {
            showError(errorBox, err.message);
            resultsContainer.style.display = 'none';
        }
    }

    function renderEquivalenceResults(res) {
        const statusBox = document.getElementById('equiv-status-box');
        const statusTitle = document.getElementById('equiv-status-title');
        const statusDesc = document.getElementById('equiv-status-desc');

        if (res.isEquivalent) {
            statusBox.className = 'status-banner success-banner';
            statusTitle.textContent = 'LOGICALLY EQUIVALENT (A ≡ B)';
            statusDesc.textContent = `Both expressions produce identical truth values across all ${res.totalRows} assignments. Therefore, (A ↔ B) is a Tautology.`;
        } else {
            statusBox.className = 'status-banner danger-banner';
            statusTitle.textContent = 'NOT LOGICALLY EQUIVALENT (A ≢ B)';
            const firstCe = res.counterexamples[0];
            const ceStr = Object.entries(firstCe.assignment).map(([k, v]) => `${k}=${v ? 'T' : 'F'}`).join(', ');
            statusDesc.textContent = `Discrepancy in ${res.counterexamples.length} row(s). Counterexample at Row #${firstCe.rowIndex} (${ceStr}): Expression A = ${firstCe.valA ? 'T' : 'F'}, but Expression B = ${firstCe.valB ? 'T' : 'F'}.`;
        }

        // Reasoning steps
        const reasoningContainer = document.getElementById('equiv-reasoning-steps');
        reasoningContainer.innerHTML = res.reasoningSteps.map(step => `
            <div class="reasoning-step">
                <div class="step-num">Step ${step.step}</div>
                <div class="step-body">
                    <h5>${escapeHtml(step.title)}</h5>
                    <p>${escapeHtml(step.content).replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `).join('');

        // Comparative Truth Table
        const thead = document.getElementById('equiv-table-head');
        const tbody = document.getElementById('equiv-table-body');
        const isTF = AppState.tableDisplayMode === 'TF';
        const formatVal = (v) => isTF ? (v ? '<span class="val-t">T</span>' : '<span class="val-f">F</span>') : (v ? '<span class="val-1">1</span>' : '<span class="val-0">0</span>');

        let headHtml = '<tr><th class="th-row-num">#</th>';
        res.variables.forEach(v => headHtml += `<th class="th-var">${escapeHtml(v)}</th>`);
        headHtml += `<th class="th-sub">Expression A<br><small>${escapeHtml(res.exprA)}</small></th>`;
        headHtml += `<th class="th-sub">Expression B<br><small>${escapeHtml(res.exprB)}</small></th>`;
        headHtml += `<th class="th-root">A ↔ B</th></tr>`;
        thead.innerHTML = headHtml;

        let bodyHtml = '';
        res.rows.forEach(r => {
            const rowClass = r.iffVal ? 'row-match' : 'row-mismatch';
            bodyHtml += `<tr class="${rowClass}">`;
            bodyHtml += `<td class="td-row-num">${r.rowIndex}</td>`;
            res.variables.forEach(v => {
                bodyHtml += `<td class="td-var">${formatVal(r.assignment[v])}</td>`;
            });
            bodyHtml += `<td class="td-sub">${formatVal(r.valA)}</td>`;
            bodyHtml += `<td class="td-sub">${formatVal(r.valB)}</td>`;
            bodyHtml += `<td class="td-root">${formatVal(r.iffVal)}</td>`;
            bodyHtml += `</tr>`;
        });
        tbody.innerHTML = bodyHtml;
    }

    /**
     * FEATURE 5: INFERENCE ENGINE
     */
    function initInferenceEngine() {
        const addPremiseBtn = document.getElementById('add-premise-btn');
        const premisesContainer = document.getElementById('premises-container');
        const evaluateBtn = document.getElementById('evaluate-inference-btn');
        const presetSelect = document.getElementById('inference-presets');

        if (addPremiseBtn && premisesContainer) {
            addPremiseBtn.addEventListener('click', () => {
                const count = premisesContainer.querySelectorAll('.premise-row').length + 1;
                const row = document.createElement('div');
                row.className = 'premise-row';
                row.innerHTML = `
                    <span class="premise-label">Premise ${count}:</span>
                    <input type="text" class="logic-input premise-input" placeholder="e.g. P → Q">
                    <button type="button" class="btn-icon remove-premise-btn" title="Remove Premise"><i class='bx bx-trash'></i></button>
                `;
                premisesContainer.appendChild(row);
                rebindRemoveButtons();
            });
        }

        function rebindRemoveButtons() {
            document.querySelectorAll('.remove-premise-btn').forEach(btn => {
                btn.onclick = () => {
                    const rows = premisesContainer.querySelectorAll('.premise-row');
                    if (rows.length > 1) {
                        btn.closest('.premise-row').remove();
                        // Re-label premises
                        premisesContainer.querySelectorAll('.premise-row').forEach((r, idx) => {
                            r.querySelector('.premise-label').textContent = `Premise ${idx + 1}:`;
                        });
                    } else {
                        showToast('At least one premise is required.');
                    }
                };
            });
        }
        rebindRemoveButtons();

        if (evaluateBtn) {
            evaluateBtn.addEventListener('click', runInferenceEvaluation);
        }

        if (presetSelect) {
            presetSelect.addEventListener('change', () => {
                const val = presetSelect.value;
                if (!val) return;

                const [premisePart, concPart] = val.split(';;;');
                const premises = premisePart.split('|');

                // Clear existing
                premisesContainer.innerHTML = '';
                premises.forEach((p, idx) => {
                    const row = document.createElement('div');
                    row.className = 'premise-row';
                    row.innerHTML = `
                        <span class="premise-label">Premise ${idx + 1}:</span>
                        <input type="text" class="logic-input premise-input" value="${p.trim()}">
                        <button type="button" class="btn-icon remove-premise-btn" title="Remove Premise"><i class='bx bx-trash'></i></button>
                    `;
                    premisesContainer.appendChild(row);
                });
                rebindRemoveButtons();

                document.getElementById('conclusion-input').value = concPart.trim();
                runInferenceEvaluation();
            });
        }

        // Set default Modus Ponens
        const concInput = document.getElementById('conclusion-input');
        if (concInput && !concInput.value) {
            concInput.value = 'Q';
        }
    }

    function runInferenceEvaluation() {
        const errorBox = document.getElementById('inference-error');
        const resultsContainer = document.getElementById('inference-results');
        errorBox.style.display = 'none';

        const premiseInputs = document.querySelectorAll('.premise-input');
        const premises = Array.from(premiseInputs).map(inp => inp.value.trim()).filter(Boolean);
        const conclusion = document.getElementById('conclusion-input').value.trim();

        if (premises.length === 0) {
            showError(errorBox, 'Please provide at least one premise.');
            resultsContainer.style.display = 'none';
            return;
        }

        if (!conclusion) {
            showError(errorBox, 'Please provide a conclusion.');
            resultsContainer.style.display = 'none';
            return;
        }

        try {
            const res = LogicInference.evaluateArgument(premises, conclusion);
            renderInferenceResults(res);
            resultsContainer.style.display = 'block';

            const badgeHtml = res.isValid
                ? `<span class="badge badge-success">Valid Deduction</span>`
                : `<span class="badge badge-danger">Fallacy</span>`;
            logActivity('Inference Engine', `${premises.join('; ')} ⊢ ${conclusion}`, badgeHtml);

        } catch (err) {
            showError(errorBox, err.message);
            resultsContainer.style.display = 'none';
        }
    }

    function renderInferenceResults(res) {
        const banner = document.getElementById('inference-status-banner');
        const title = document.getElementById('inference-status-title');
        const desc = document.getElementById('inference-status-desc');
        const schemaBox = document.getElementById('inference-schema-display');

        // Render Schema Box
        let schemaStr = res.premiseStrings.map(p => `   ${p}`).join('\n');
        schemaStr += '\n────────────────────────\n';
        schemaStr += `∴  ${res.conclusionString}`;
        schemaBox.textContent = schemaStr;

        if (res.isValid) {
            banner.className = 'status-banner success-banner';
            title.textContent = 'VALID DEDUCTIVE ARGUMENT (Premises ⊨ Conclusion)';
            desc.textContent = res.recognizedRule
                ? `Recognized standard rule: ${res.recognizedRule.name}. In every critical row where all premises are true, the conclusion is necessarily true.`
                : `Verified by truth table: in all critical rows, the conclusion evaluates to TRUE.`;
        } else {
            banner.className = 'status-banner danger-banner';
            title.textContent = 'INVALID ARGUMENT (FORMAL FALLACY)';
            desc.textContent = res.recognizedRule
                ? `Recognized fallacy: ${res.recognizedRule.name}. Counterexample found where premises are true, yet conclusion is false.`
                : `Fallacy detected: premises fail to guarantee truth of the conclusion.`;
        }

        // Reasoning steps
        const reasoningContainer = document.getElementById('inference-reasoning-steps');
        reasoningContainer.innerHTML = res.reasoningSteps.map(step => `
            <div class="reasoning-step">
                <div class="step-num">Step ${step.step}</div>
                <div class="step-body">
                    <h5>${escapeHtml(step.title)}</h5>
                    <p>${escapeHtml(step.content).replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `).join('');

        // Critical Rows Table
        const thead = document.getElementById('inference-table-head');
        const tbody = document.getElementById('inference-table-body');
        const isTF = AppState.tableDisplayMode === 'TF';
        const formatVal = (v) => isTF ? (v ? '<span class="val-t">T</span>' : '<span class="val-f">F</span>') : (v ? '<span class="val-1">1</span>' : '<span class="val-0">0</span>');

        let headHtml = '<tr><th class="th-row-num">#</th>';
        res.variables.forEach(v => headHtml += `<th class="th-var">${escapeHtml(v)}</th>`);
        res.premiseStrings.forEach((p, idx) => headHtml += `<th class="th-sub">Premise ${idx + 1}<br><small>${escapeHtml(p)}</small></th>`);
        headHtml += `<th class="th-root">Conclusion<br><small>${escapeHtml(res.conclusionString)}</small></th>`;
        headHtml += `<th class="th-sub">Row Type</th></tr>`;
        thead.innerHTML = headHtml;

        let bodyHtml = '';
        res.rows.forEach(r => {
            let rowClass = '';
            let statusText = 'Non-Critical';

            if (r.isCriticalRow) {
                if (r.isInvalidRow) {
                    rowClass = 'row-counterexample';
                    statusText = '<span class="badge badge-danger">Fallacy Row</span>';
                } else {
                    rowClass = 'row-critical';
                    statusText = '<span class="badge badge-success">Critical Row</span>';
                }
            }

            bodyHtml += `<tr class="${rowClass}">`;
            bodyHtml += `<td class="td-row-num">${r.rowIndex}</td>`;
            res.variables.forEach(v => {
                bodyHtml += `<td class="td-var">${formatVal(r.assignment[v])}</td>`;
            });
            r.premiseValues.forEach(pv => {
                bodyHtml += `<td class="td-sub">${formatVal(pv)}</td>`;
            });
            bodyHtml += `<td class="td-root">${formatVal(r.conclusionValue)}</td>`;
            bodyHtml += `<td class="td-sub">${statusText}</td>`;
            bodyHtml += `</tr>`;
        });
        tbody.innerHTML = bodyHtml;
    }

    /**
     * FEATURE 6: RESOLUTION SOLVER
     */
    function initResolutionSolver() {
        const addClauseBtn = document.getElementById('add-clause-btn');
        const clausesContainer = document.getElementById('clauses-container');
        const solveBtn = document.getElementById('solve-resolution-btn');
        const presetSelect = document.getElementById('resolution-presets');

        if (addClauseBtn && clausesContainer) {
            addClauseBtn.addEventListener('click', () => {
                const count = clausesContainer.querySelectorAll('.clause-row').length + 1;
                const row = document.createElement('div');
                row.className = 'clause-row';
                row.innerHTML = `
                    <span class="clause-label">C${count}:</span>
                    <input type="text" class="logic-input clause-input" placeholder="e.g. (P ∨ Q)">
                    <button type="button" class="btn-icon remove-clause-btn" title="Remove Clause"><i class='bx bx-trash'></i></button>
                `;
                clausesContainer.appendChild(row);
                rebindClauseRemoveButtons();
            });
        }

        function rebindClauseRemoveButtons() {
            document.querySelectorAll('.remove-clause-btn').forEach(btn => {
                btn.onclick = () => {
                    const rows = clausesContainer.querySelectorAll('.clause-row');
                    if (rows.length > 1) {
                        btn.closest('.clause-row').remove();
                        clausesContainer.querySelectorAll('.clause-row').forEach((r, idx) => {
                            r.querySelector('.clause-label').textContent = `C${idx + 1}:`;
                        });
                    } else {
                        showToast('At least one clause is required.');
                    }
                };
            });
        }
        rebindClauseRemoveButtons();

        if (solveBtn) {
            solveBtn.addEventListener('click', runResolutionSolver);
        }

        if (presetSelect) {
            presetSelect.addEventListener('change', () => {
                const val = presetSelect.value;
                if (!val) return;

                const clauses = val.split(';;;');
                clausesContainer.innerHTML = '';
                clauses.forEach((c, idx) => {
                    const row = document.createElement('div');
                    row.className = 'clause-row';
                    row.innerHTML = `
                        <span class="clause-label">C${idx + 1}:</span>
                        <input type="text" class="logic-input clause-input" value="${c.trim()}">
                        <button type="button" class="btn-icon remove-clause-btn" title="Remove Clause"><i class='bx bx-trash'></i></button>
                    `;
                    clausesContainer.appendChild(row);
                });
                rebindClauseRemoveButtons();
                runResolutionSolver();
            });
        }
    }

    function runResolutionSolver() {
        const errorBox = document.getElementById('resolution-error');
        const resultsContainer = document.getElementById('resolution-results');
        errorBox.style.display = 'none';

        const clauseInputs = document.querySelectorAll('.clause-input');
        const clauses = Array.from(clauseInputs).map(inp => inp.value.trim()).filter(Boolean);

        if (clauses.length === 0) {
            showError(errorBox, 'Please enter at least one propositional clause.');
            resultsContainer.style.display = 'none';
            return;
        }

        try {
            const res = LogicResolution.solveResolution(clauses);
            renderResolutionResults(res);
            resultsContainer.style.display = 'block';

            const badgeHtml = res.emptyClauseDerived
                ? `<span class="badge badge-success">Refutation Proved (□)</span>`
                : `<span class="badge badge-warning">Satisfiable</span>`;
            logActivity('Resolution Solver', clauses.join(', '), badgeHtml);

        } catch (err) {
            showError(errorBox, err.message);
            resultsContainer.style.display = 'none';
        }
    }

    function renderResolutionResults(res) {
        const banner = document.getElementById('resolution-status-banner');
        const title = document.getElementById('resolution-status-title');
        const desc = document.getElementById('resolution-status-desc');

        if (res.emptyClauseDerived) {
            banner.className = 'status-banner success-banner';
            title.textContent = 'CONTRADICTION DERIVED: EMPTY CLAUSE (□) REACHED';
            desc.textContent = `The empty clause was derived at ${res.emptyClauseId}. This formally proves that the clause set is UNSATISFIABLE (and any corresponding theorem is VALID by refutation).`;
        } else {
            banner.className = 'status-banner warning-banner';
            title.textContent = 'SATURATION REACHED (NO CONTRADICTION)';
            desc.textContent = `All possible complementary resolvents have been generated, and the empty clause was NOT derived. The clause set is SATISFIABLE.`;
        }

        // Reasoning steps
        const reasoningContainer = document.getElementById('resolution-reasoning-steps');
        reasoningContainer.innerHTML = res.reasoningSteps.map(step => `
            <div class="reasoning-step">
                <div class="step-num">Step ${step.step}</div>
                <div class="step-body">
                    <h5>${escapeHtml(step.title)}</h5>
                    <p>${escapeHtml(step.content).replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `).join('');

        // Step-by-Step Derivation Table
        const tbody = document.getElementById('resolution-steps-body');
        if (res.derivationSteps.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">No resolution steps performed (set was already empty or cannot resolve).</td></tr>`;
        } else {
            tbody.innerHTML = res.derivationSteps.map(s => `
                <tr class="${s.isEmpty ? 'row-empty-clause' : ''}">
                    <td><strong>${s.stepNumber}</strong></td>
                    <td><code>${s.clauseId}</code></td>
                    <td><code>${s.parent1}</code> (${escapeHtml(s.parent1Str)})</td>
                    <td><code>${s.parent2}</code> (${escapeHtml(s.parent2Str)})</td>
                    <td><span class="badge badge-accent">${escapeHtml(s.resolvedOn)}</span></td>
                    <td class="td-resolvent"><strong>${escapeHtml(s.resolventStr)}</strong></td>
                </tr>
            `).join('');
        }
    }

    /**
     * FEATURE 7: NATURAL LANGUAGE CONVERTER
     */
    function initNaturalLanguageConverter() {
        const convertBtn = document.getElementById('nl-convert-btn');
        const input = document.getElementById('nl-sentence-input');
        const profileSelect = document.getElementById('nl-profile-select');
        const sendToAnalyzerBtn = document.getElementById('nl-send-to-analyzer-btn');

        if (profileSelect) {
            profileSelect.addEventListener('change', () => {
                const idx = parseInt(profileSelect.value, 10);
                const profile = LogicNaturalLanguage.DEFAULT_PROFILES[idx];
                if (profile) {
                    document.getElementById('nl-var-p').value = profile.variables.P || '';
                    document.getElementById('nl-var-q').value = profile.variables.Q || '';
                    document.getElementById('nl-var-r').value = profile.variables.R || '';
                }
            });
        }

        if (convertBtn && input) {
            convertBtn.addEventListener('click', runNaturalLanguageConversion);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') runNaturalLanguageConversion();
            });
        }

        // Example sentences
        document.querySelectorAll('.nl-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sentence = btn.getAttribute('data-sentence');
                if (sentence && input) {
                    input.value = sentence;
                    runNaturalLanguageConversion();
                }
            });
        });

        if (sendToAnalyzerBtn) {
            sendToAnalyzerBtn.addEventListener('click', () => {
                const formula = sendToAnalyzerBtn.getAttribute('data-formula');
                if (formula) {
                    switchTab('analyzer');
                    const analyzerInput = document.getElementById('analyzer-input');
                    if (analyzerInput) {
                        analyzerInput.value = formula;
                        runExpressionAnalysis();
                    }
                }
            });
        }
    }

    function runNaturalLanguageConversion() {
        const input = document.getElementById('nl-sentence-input');
        const errorBox = document.getElementById('nl-error');
        const resultsContainer = document.getElementById('nl-results');
        errorBox.style.display = 'none';

        const sentence = input.value.trim();
        if (!sentence) {
            showError(errorBox, 'Please enter a natural language statement.');
            resultsContainer.style.display = 'none';
            return;
        }

        const dict = {
            P: document.getElementById('nl-var-p').value.trim() || 'It is raining',
            Q: document.getElementById('nl-var-q').value.trim() || 'The ground is wet',
            R: document.getElementById('nl-var-r').value.trim() || 'We carry an umbrella'
        };

        try {
            const res = LogicNaturalLanguage.convertSentence(sentence, dict);
            renderNaturalLanguageResults(res);
            resultsContainer.style.display = 'block';

            logActivity('Natural Language', sentence, `<span class="badge badge-accent">${escapeHtml(res.formula)}</span>`);

        } catch (err) {
            showError(errorBox, err.message);
            resultsContainer.style.display = 'none';
        }
    }

    function renderNaturalLanguageResults(res) {
        document.getElementById('nl-formula-display').textContent = res.formula;
        document.getElementById('nl-rule-title').textContent = res.ruleName;
        document.getElementById('nl-rule-explanation').textContent = res.ruleExplanation;

        const sendBtn = document.getElementById('nl-send-to-analyzer-btn');
        if (sendBtn) {
            sendBtn.setAttribute('data-formula', res.formula);
        }

        const reasoningContainer = document.getElementById('nl-reasoning-steps');
        reasoningContainer.innerHTML = res.reasoningSteps.map(step => `
            <div class="reasoning-step">
                <div class="step-num">Step ${step.step}</div>
                <div class="step-body">
                    <h5>${escapeHtml(step.title)}</h5>
                    <p>${escapeHtml(step.content).replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * FEATURE 8: GAMIFIED LOGIC CHALLENGE
     */
    function initLogicChallenge() {
        AppState.quizEngine = new LogicQuiz.ChallengeEngine();

        const startBtn = document.getElementById('quiz-start-btn');
        const nextBtn = document.getElementById('quiz-next-btn');
        const hintBtn = document.getElementById('quiz-hint-btn');
        const restartBtn = document.getElementById('quiz-restart-btn');

        if (startBtn) {
            startBtn.addEventListener('click', startQuiz);
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', loadNextQuestion);
        }
        if (restartBtn) {
            restartBtn.addEventListener('click', startQuiz);
        }
        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                if (AppState.quizEngine && AppState.quizEngine.currentQuestion) {
                    showToast(`💡 Hint: ${AppState.quizEngine.currentQuestion.hint}`);
                }
            });
        }
    }

    function startQuiz() {
        AppState.quizEngine.reset();
        document.getElementById('quiz-welcome-screen').style.display = 'none';
        document.getElementById('quiz-active-screen').style.display = 'block';
        updateQuizHUD();
        loadNextQuestion();
    }

    function updateQuizHUD() {
        const engine = AppState.quizEngine;
        const level = engine.getCurrentLevel();

        document.getElementById('quiz-score-val').textContent = engine.score;
        document.getElementById('quiz-streak-val').textContent = engine.streak;
        document.getElementById('quiz-level-badge').textContent = `Lvl ${level.level}: ${level.title}`;

        const nextLvl = engine.getNextLevel();
        const progressPct = nextLvl ? Math.min(100, Math.round(((engine.score - level.minScore) / (nextLvl.minScore - level.minScore)) * 100)) : 100;
        document.getElementById('quiz-level-progress-bar').style.width = `${progressPct}%`;
    }

    function loadNextQuestion() {
        clearInterval(AppState.quizTimerId);
        document.getElementById('quiz-feedback-box').style.display = 'none';
        document.getElementById('quiz-options-container').innerHTML = '';

        const q = AppState.quizEngine.generateQuestion();
        const level = AppState.quizEngine.getCurrentLevel();

        document.getElementById('quiz-category-badge').textContent = q.category;
        document.getElementById('quiz-prompt-text').textContent = q.prompt;
        document.getElementById('quiz-formula-display').textContent = q.formulaDisplay;
        document.getElementById('quiz-question-text').textContent = q.questionText;

        // Render option buttons
        const optionsContainer = document.getElementById('quiz-options-container');
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-quiz-option';
            btn.textContent = opt;
            btn.onclick = () => handleQuizAnswer(opt);
            optionsContainer.appendChild(btn);
        });

        // Start countdown timer
        AppState.quizTimeLeft = level.timeLimit;
        updateTimerDisplay();

        AppState.quizTimerId = setInterval(() => {
            AppState.quizTimeLeft--;
            updateTimerDisplay();

            if (AppState.quizTimeLeft <= 0) {
                clearInterval(AppState.quizTimerId);
                handleQuizAnswer('__TIMEOUT__');
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const timerVal = document.getElementById('quiz-timer-val');
        if (timerVal) {
            timerVal.textContent = `${AppState.quizTimeLeft}s`;
            if (AppState.quizTimeLeft <= 5) {
                timerVal.classList.add('timer-urgent');
            } else {
                timerVal.classList.remove('timer-urgent');
            }
        }
    }

    function handleQuizAnswer(selectedOption) {
        clearInterval(AppState.quizTimerId);

        // Disable all option buttons
        document.querySelectorAll('.btn-quiz-option').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === AppState.quizEngine.currentQuestion.correctAnswer) {
                btn.classList.add('correct-choice');
            } else if (btn.textContent === selectedOption) {
                btn.classList.add('wrong-choice');
            }
        });

        const outcome = AppState.quizEngine.submitAnswer(selectedOption, AppState.quizTimeLeft);
        updateQuizHUD();

        const feedbackBox = document.getElementById('quiz-feedback-box');
        const feedbackTitle = document.getElementById('quiz-feedback-title');
        const feedbackDesc = document.getElementById('quiz-feedback-desc');
        const feedbackPoints = document.getElementById('quiz-feedback-points');

        if (outcome.isCorrect) {
            feedbackBox.className = 'quiz-feedback correct-feedback';
            feedbackTitle.innerHTML = `<i class='bx bx-check-circle'></i> Correct!`;
            feedbackPoints.textContent = `+${outcome.pointsEarned} Points (Streak: ${outcome.streak}x)`;
        } else {
            feedbackBox.className = 'quiz-feedback wrong-feedback';
            feedbackTitle.innerHTML = `<i class='bx bx-x-circle'></i> Incorrect!`;
            feedbackPoints.textContent = `Correct answer: "${outcome.correctAnswer}"`;
        }

        feedbackDesc.innerHTML = `<p>${escapeHtml(outcome.explanation)}</p>`;
        feedbackBox.style.display = 'block';
    }

    /**
     * FEATURE 9: LEARNING SECTION
     */
    function initLearningSection() {
        const container = document.getElementById('learning-topics-container');
        if (!container || !LogicLearning) return;

        container.innerHTML = LogicLearning.TOPICS.map(topic => `
            <div class="learning-topic-card" id="topic-${topic.id}">
                <div class="topic-header">
                    <div class="topic-icon"><i class='bx ${topic.icon}'></i></div>
                    <div class="topic-title-group">
                        <h3>${escapeHtml(topic.title)}</h3>
                        <p class="topic-subtitle">${escapeHtml(topic.subtitle)}</p>
                    </div>
                </div>
                <div class="topic-summary">${escapeHtml(topic.summary)}</div>
                <div class="topic-content">${topic.content}</div>
                ${topic.tryAction ? `
                    <div class="topic-action-footer">
                        <button class="btn btn-secondary btn-sm topic-try-btn" data-tool="${topic.tryAction.tool}" data-payload='${JSON.stringify(topic.tryAction)}'>
                            <i class='bx bx-play-circle'></i> ${escapeHtml(topic.tryAction.label)}
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');

        // Wire "Try in Tool" buttons
        container.querySelectorAll('.topic-try-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.getAttribute('data-tool');
                const payload = JSON.parse(btn.getAttribute('data-payload'));

                if (tool === 'analyzer' || tool === 'truth-table') {
                    switchTab('analyzer');
                    const input = document.getElementById('analyzer-input');
                    if (input && payload.expr) {
                        input.value = payload.expr;
                        runExpressionAnalysis();
                    }
                } else if (tool === 'equivalence') {
                    switchTab('equivalence');
                    const inputA = document.getElementById('equiv-input-a');
                    const inputB = document.getElementById('equiv-input-b');
                    if (inputA && inputB && payload.exprA && payload.exprB) {
                        inputA.value = payload.exprA;
                        inputB.value = payload.exprB;
                        runEquivalenceCheck();
                    }
                } else if (tool === 'inference') {
                    switchTab('inference');
                    const container = document.getElementById('premises-container');
                    if (container && payload.premises && payload.conclusion) {
                        container.innerHTML = '';
                        payload.premises.forEach((p, idx) => {
                            const row = document.createElement('div');
                            row.className = 'premise-row';
                            row.innerHTML = `
                                <span class="premise-label">Premise ${idx + 1}:</span>
                                <input type="text" class="logic-input premise-input" value="${p}">
                                <button type="button" class="btn-icon remove-premise-btn" title="Remove Premise"><i class='bx bx-trash'></i></button>
                            `;
                            container.appendChild(row);
                        });
                        document.getElementById('conclusion-input').value = payload.conclusion;
                        runInferenceEvaluation();
                    }
                } else if (tool === 'resolution') {
                    switchTab('resolution');
                    const container = document.getElementById('clauses-container');
                    if (container && payload.clauses) {
                        container.innerHTML = '';
                        payload.clauses.forEach((c, idx) => {
                            const row = document.createElement('div');
                            row.className = 'clause-row';
                            row.innerHTML = `
                                <span class="clause-label">C${idx + 1}:</span>
                                <input type="text" class="logic-input clause-input" value="${c}">
                                <button type="button" class="btn-icon remove-clause-btn" title="Remove Clause"><i class='bx bx-trash'></i></button>
                            `;
                            container.appendChild(row);
                        });
                        runResolutionSolver();
                    }
                }
            });
        });
    }

    /**
     * UI Utilities
     */
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }

    function showToast(message) {
        let toast = document.getElementById('app-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'app-toast';
            toast.className = 'app-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

})();

import { state } from './state.js';
import { getEditor } from './editor.js';

const outputDiv = document.getElementById('output');
const errorsDiv = document.getElementById('errors');
const stdinInput = document.getElementById('stdin-input');

// Helper
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function runCode() {
    const editor = getEditor();
    if (!editor) return;

    const code = editor.getValue();
    const inputVal = stdinInput.value;
    outputDiv.innerHTML = '';
    errorsDiv.innerHTML = '';

    // Detect language from current file
    const currentFile = state.activeFileIndex >= 0 ? state.openFiles[state.activeFileIndex]?.name : null;
    const isPython = currentFile?.endsWith('.py');

    const executePromise = isPython
        ? window.api.runPython(code, inputVal)
        : window.api.runCode(code);

    executePromise.then(result => {
        let hasErrors = false;
        let outputLineNum = 1;
        let errorLineNum = 1;

        if (result.logs) {
            result.logs.forEach(log => {
                const div = document.createElement('div');
                div.className = 'log-entry ' + log.type;

                if (log.type === 'error') {
                    div.innerHTML = `<span class="line-num">${errorLineNum++}</span>${escapeHtml(log.message)}`;
                    errorsDiv.appendChild(div);
                    hasErrors = true;
                } else {
                    div.innerHTML = `<span class="line-num">${outputLineNum++}</span>${escapeHtml(log.message)}`;
                    outputDiv.appendChild(div);
                }
            });
        }
        if (result.error) {
            const div = document.createElement('div');
            div.className = 'log-entry error';
            div.innerHTML = `<span class="line-num">${errorLineNum++}</span>${escapeHtml(result.error)}`;
            errorsDiv.appendChild(div);
            hasErrors = true;
        }

        // Auto-switch to the appropriate tab
        switchConsoleTab(hasErrors ? 'errors' : 'output');
    });
}

export function switchConsoleTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.console-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.console-tab-content').forEach(c => {
        c.classList.remove('active');
    });
    document.getElementById('tab-' + tabName).classList.add('active');
}

export function initConsole() {
    document.getElementById('run-btn').onclick = runCode;
    document.getElementById('clear-btn').onclick = () => { outputDiv.innerHTML = ''; };

    // Tab click handlers
    document.querySelectorAll('.console-tab').forEach(tab => {
        tab.addEventListener('click', () => switchConsoleTab(tab.dataset.tab));
    });

    const lineNumbers = document.getElementById('input-line-numbers');
    
    const updateLineNumbers = () => {
        const lines = stdinInput.value.split('\n').length;
        lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('\n');
    };

    const syncScroll = () => {
        lineNumbers.scrollTop = stdinInput.scrollTop;
    };

    stdinInput.addEventListener('input', updateLineNumbers);
    stdinInput.addEventListener('keydown', () => {
        // Defer to handle Enter key allowing resize before calc
        setTimeout(updateLineNumbers, 0); 
    });
    stdinInput.addEventListener('scroll', syncScroll);

    // Init
    updateLineNumbers();
}

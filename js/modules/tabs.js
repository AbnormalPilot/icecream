import { state, saveState } from './state.js';
import { getEditor } from './editor.js';
import { renderFileList } from './files.js';

const tabsContainer = document.getElementById('tabs-container');

export function setActiveTab(index) {
    state.activeFileIndex = index;
    const editor = getEditor();

    if (index >= 0 && state.openFiles[index]) {
        const file = state.openFiles[index];
        if (editor) {
            editor.setValue(file.content);
            editor.clearHistory();

            // Switch editor mode based on file type
            const isPython = file.name.endsWith('.py');
            editor.setOption('mode', isPython ? 'python' : 'javascript');

            // Disable linting for Python (no Python linter)
            editor.setOption('lint', isPython ? false : { esversion: 11, asi: true, boss: true, expr: true, laxbreak: true, laxcomma: true, sub: true, undef: false, unused: false });
        }
    } else {
        if (editor) editor.setValue('');
    }

    renderTabs();
    renderFileList();
    saveState();

    // Ensure editor is focused and ready
    setTimeout(() => {
        if (editor) {
            editor.refresh();
            editor.focus();
        }
    }, 10);
}

export function closeTab(index) {
    state.openFiles.splice(index, 1);

    if (state.openFiles.length === 0) {
        state.activeFileIndex = -1;
        const editor = getEditor();
        if (editor) editor.setValue('');
    } else if (index <= state.activeFileIndex) {
        state.activeFileIndex = Math.max(0, state.activeFileIndex - 1);
        const editor = getEditor();
        if (editor) editor.setValue(state.openFiles[state.activeFileIndex].content);
    }

    renderTabs();
    renderFileList();
    saveState();
}

export function renderTabs() {
    tabsContainer.innerHTML = '';

    state.openFiles.forEach((file, idx) => {
        const tab = document.createElement('div');
        tab.className = 'tab' + (idx === state.activeFileIndex ? ' active' : '');

        const isPython = file.name.endsWith('.py');
        const iconHtml = isPython
            ? '<img src="./assets/python-logo.png" class="file-icon" alt="PY">'
            : '<img src="./assets/js-logo.png" class="file-icon" alt="JS">';

        tab.innerHTML = `
            ${iconHtml}
            <span class="tab-name">${file.name}${file.dirty ? ' •' : ''}</span>
            <span class="tab-close">×</span>
        `;

        tab.onclick = (e) => {
            if (e.target.classList.contains('tab-close')) {
                e.stopPropagation();
                closeTab(idx);
            } else {
                setActiveTab(idx);
            }
        };

        tabsContainer.appendChild(tab);
    });
}

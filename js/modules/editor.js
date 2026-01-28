import { state } from './state.js';
import { saveCurrentFile } from './files.js';

let editor = null;
let autoSaveTimer = null;

// Helper to get editor instance
export function getEditor() {
    return editor;
}

export function initEditor() {
    // Ensure we are looking at the global object
    const CM = window.CodeMirror || CodeMirror;

    if (typeof CM === 'undefined') {
        console.error('CodeMirror is not loaded (undefined)!');
        alert('Critical Error: CodeMirror library could not be found. Check console for details.');
        return;
    }

    try {
        console.log('Attempting to initialize CodeMirror...');
        editor = CM.fromTextArea(document.getElementById('code-editor'), {
            mode: 'javascript',
            theme: 'dracula',
            lineNumbers: true,
            lineWrapping: false,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-lint-markers'],
            lint: {
                esversion: 11,
                asi: true,
                boss: true,
                expr: true,
                laxbreak: true,
                laxcomma: true,
                sub: true,
                undef: false,
                unused: false
            },
            autoCloseBrackets: true,
            matchBrackets: true,
            tabSize: 2,
            indentWithTabs: false,
            inputStyle: 'contenteditable',
            extraKeys: {
                'Cmd-Enter': () => document.getElementById('run-btn').click(),
                'Ctrl-Enter': () => document.getElementById('run-btn').click(),
                'F5': () => document.getElementById('run-btn').click(),
                'Cmd-S': () => saveCurrentFile(),
                'Ctrl-S': () => saveCurrentFile()
            }
        });

        if (!editor) {
            throw new Error('CodeMirror.fromTextArea returned null/undefined');
        }

        console.log('CodeMirror initialized successfully.');
    } catch (e) {
        console.error('CodeMirror initialization failed:', e);
        alert('CodeMirror Error: ' + e.message);
    }


    // Force editor to be editable
    editor.setOption('readOnly', false);

    // Auto-save on change
    editor.on('change', () => {
        if (state.activeFileIndex >= 0 && state.openFiles[state.activeFileIndex]) {
            state.openFiles[state.activeFileIndex].content = editor.getValue();
            state.openFiles[state.activeFileIndex].dirty = true;

            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => saveCurrentFile(true), 500);
        }
    });

    // Resize observer to refresh editor when container changes
    const editorArea = document.getElementById('editor-area');
    if (editorArea) {
        const r = new ResizeObserver(() => {
            if (editor) editor.refresh();
        });
        r.observe(editorArea);
    } else {
        console.warn('Editor area element not found for ResizeObserver');
    }

    // Listen for theme changes from theme.js
    window.addEventListener('theme-changed', (e) => {
        editor.setOption('theme', e.detail.theme);
    });
}

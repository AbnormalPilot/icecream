import { state } from './state.js';
import { saveCurrentFile } from './files.js';

let editor = null;
let autoSaveTimer = null;

// Helper to get editor instance
export function getEditor() {
    return editor;
}

export function initEditor() {
    // Check if editor was already initialized by inline script
    if (window._earlyEditor) {
        console.log('Using early-initialized editor');
        editor = window._earlyEditor;

        // Add keyboard shortcuts that require module imports
        editor.setOption('extraKeys', {
            'Cmd-Enter': () => document.getElementById('run-btn').click(),
            'Ctrl-Enter': () => document.getElementById('run-btn').click(),
            'F5': () => document.getElementById('run-btn').click(),
            'Cmd-S': () => saveCurrentFile(),
            'Ctrl-S': () => saveCurrentFile()
        });

        // Enable linting after a short delay
        setTimeout(() => {
            if (typeof JSHINT !== 'undefined') {
                editor.setOption('lint', {
                    esversion: 11,
                    asi: true,
                    boss: true,
                    expr: true,
                    laxbreak: true,
                    laxcomma: true,
                    sub: true,
                    undef: false,
                    unused: false
                });
                console.log('Linting enabled');
            }
        }, 100);
    } else {
        // Fallback: Initialize normally if inline script didn't run
        const CM = window.CodeMirror || CodeMirror;

        if (typeof CM === 'undefined') {
            console.error('CodeMirror is not loaded (undefined)!');
            alert('Critical Error: CodeMirror library could not be found. Check console for details.');
            return;
        }

        try {
            console.log('Initializing CodeMirror (fallback path)...');

            editor = CM.fromTextArea(document.getElementById('code-editor'), {
                mode: 'javascript',
                theme: 'dracula',
                lineNumbers: true,
                lineWrapping: false,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-lint-markers'],
                lint: false,
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

            // Enable linting AFTER initial render
            setTimeout(() => {
                if (typeof JSHINT !== 'undefined') {
                    editor.setOption('lint', {
                        esversion: 11,
                        asi: true,
                        boss: true,
                        expr: true,
                        laxbreak: true,
                        laxcomma: true,
                        sub: true,
                        undef: false,
                        unused: false
                    });
                    console.log('Linting enabled');
                }
            }, 100);

        } catch (e) {
            console.error('CodeMirror initialization failed:', e);
            alert('CodeMirror Error: ' + e.message);
        }
    }


    // Set initial readOnly state based on whether a file is open (usually false at start)
    editor.setOption('readOnly', state.activeFileIndex === -1 ? 'nocursor' : false);

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

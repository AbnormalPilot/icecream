import { loadState, saveState, state } from './js/modules/state.js';
import { initTheme, applyTheme } from './js/modules/theme.js';
import { initWhiteboard } from './js/modules/whiteboard.js';
import { initEditor, getEditor } from './js/modules/editor.js';
import { initFiles, refreshFileList, openFile, createNewFile, saveCurrentFile, renderFileList } from './js/modules/files.js';
import { initUI, setZoom } from './js/modules/ui.js';
import { renderTabs, setActiveTab, closeTab } from './js/modules/tabs.js';
import { initConsole } from './js/modules/console.js';

console.log('Renderer starting...');

async function init() {
    console.log('Starting Initialization');

    if (!window.api) {
        alert('CRITICAL ERROR: Preload script failed to load. window.api is missing.');
        return;
    }

    // Initialize Core UI immediately
    initTheme();
    initUI();
    initWhiteboard();
    initEditor(); // Init editor FIRST to prevent FOUC
    initFiles();
    initConsole();

    try {
        const saved = await loadState();

        // Render cached files immediately for instant sidebar
        if (state.files && state.files.length > 0) {
            renderFileList();
        }

        if (saved.theme) applyTheme(saved.theme);
        if (saved.appZoom) setZoom(saved.appZoom);

        // Don't await the file list fetching. Let it load async to populate sidebar.
        refreshFileList();

        // Defer tab rendering slightly to ensure:
        // 1. Sidebar files appear FIRST (requested user behavior)
        // 2. Welcome screen stays visible for a moment until editor is fully ready
        // Defer tab rendering slightly to ensure:
        // 1. Sidebar files appear FIRST (cached list renders instantly above)
        // 2. Welcome screen stays visible for a moment until editor is fully ready
        setTimeout(() => {
            renderTabs();

            if (state.openFiles.length > 0) {
                if (state.activeFileIndex >= state.openFiles.length) {
                    state.activeFileIndex = state.openFiles.length - 1;
                }

                if (state.activeFileIndex >= 0) {
                    setActiveTab(state.activeFileIndex);
                }
            } else {
                const editorInstance = getEditor();
                if (editorInstance) {
                    editorInstance.setValue('');
                }
            }
        }, 150); // Small delay to prioritize sidebar paint and show welcome screen briefly

        document.getElementById('github-link')?.addEventListener('click', () => {
            window.api.openExternal('https://github.com/AbnormalPilot/icecream');
        });

        // Menu IPC Listeners
        if (window.api.onCloseTab) {
            window.api.onCloseTab(() => {
                if (state.openFiles.length > 0) {
                    closeTab(state.activeFileIndex);
                } else {
                    window.api.closeWindow();
                }
            });
        }
        if (window.api.onNewFile) {
            window.api.onNewFile(() => {
                createNewFile();
            });
        }
        if (window.api.onSaveFile) {
            window.api.onSaveFile(() => {
                saveCurrentFile();
            });
        }

    } catch (err) {
        console.error('Initialization Error:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});

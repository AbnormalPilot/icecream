import { loadState, saveState, state } from './js/modules/state.js';
import { initTheme, applyTheme } from './js/modules/theme.js';
import { initWhiteboard } from './js/modules/whiteboard.js';
import { initEditor, getEditor } from './js/modules/editor.js';
import { initFiles, refreshFileList, openFile } from './js/modules/files.js';
import { initUI, setZoom } from './js/modules/ui.js';
import { renderTabs, setActiveTab } from './js/modules/tabs.js';
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

        if (saved.theme) applyTheme(saved.theme);
        if (saved.appZoom) setZoom(saved.appZoom);

        await refreshFileList();

        console.log('Initialization complete');

        if (state.openFiles.length > 0) {
            renderTabs();
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

        document.getElementById('github-link')?.addEventListener('click', () => {
            window.api.openExternal('https://github.com/AbnormalPilot/icecream');
        });
    } catch (err) {
        console.error('Initialization Error:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});

export const state = {
    files: [],           // List of filenames in workspace
    openFiles: [],       // Array of { name, content, dirty }
    activeFileIndex: -1, // Index of currently active tab
    consoleLayout: 'bottom',
    appZoom: 1
};

export function saveState() {
    const data = {
        files: state.files, // Save file list cache
        activeFileIndex: state.activeFileIndex,
        openFiles: state.openFiles,
        consoleLayout: state.consoleLayout,
        appZoom: state.appZoom,
        theme: document.documentElement.getAttribute('data-theme') || 'dracula'
    };
    localStorage.setItem('icecream-state', JSON.stringify(data));
}

export async function loadState() {
    const saved = JSON.parse(localStorage.getItem('icecream-state') || '{}');

    // We explicitly return the saved state so modules can use it
    // but we also mutate the global state object for convenience
    if (saved.files) state.files = saved.files;
    if (saved.activeFileIndex !== undefined) state.activeFileIndex = saved.activeFileIndex;
    if (saved.openFiles) state.openFiles = saved.openFiles;
    if (saved.consoleLayout) state.consoleLayout = saved.consoleLayout;
    if (saved.appZoom) state.appZoom = saved.appZoom;

    return saved;
}

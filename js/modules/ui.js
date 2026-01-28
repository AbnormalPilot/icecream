import { state, saveState } from './state.js';
import { getEditor } from './editor.js';

export function setZoom(level) {
    // Zoom now affects editor font size specifically
    // Base size is 14px, so level 1 = 14px, 1.1 = 15.4px etc.
    state.appZoom = Math.max(0.5, level); // Clamp minimum zoom

    // We no longer scale the whole app with --app-zoom
    // Instead we drive the editor font size
    document.documentElement.style.setProperty('--editor-zoom', state.appZoom);

    // Keep console zoom separate or linked if desired.
    // For now, let's keep console zoom linked to editor zoom for consistency
    document.documentElement.style.setProperty('--console-zoom', state.appZoom);

    // Refresh editor after zoom applied
    requestAnimationFrame(() => {
        const editor = getEditor();
        if (editor) editor.refresh();
    });
    saveState();
}

export function initUI() {
    // Zoom Keybindings
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
            e.preventDefault();
            setZoom(state.appZoom + 0.1);
        } else if ((e.metaKey || e.ctrlKey) && (e.key === '-')) {
            e.preventDefault();
            setZoom(state.appZoom - 0.1);
        } else if ((e.metaKey || e.ctrlKey) && (e.key === '0')) {
            e.preventDefault();
            setZoom(1);
        }
    });

    // Console Focus Zoom
    const consolePanel = document.getElementById('console-panel');
    if (consolePanel) {
        consolePanel.addEventListener('focusin', () => setZoom(state.appZoom));
        consolePanel.addEventListener('focusout', () => setZoom(state.appZoom));
    }

    initResizers();
    initDockToggle();
}

function initResizers() {
    // Sidebar Resizer
    const sidebar = document.getElementById('sidebar');
    const sidebarResizer = document.getElementById('sidebar-resizer');

    if (sidebarResizer) {
        let isResizing = false, startX = 0, startWidth = 0;

        sidebarResizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = parseInt(getComputedStyle(sidebar).width, 10);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const delta = (e.clientX - startX) / state.appZoom;
            const newWidth = Math.max(120, Math.min(400, startWidth + delta));
            sidebar.style.width = newWidth + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }

    // Console Resizer
    const consoleResizer = document.getElementById('console-resizer');
    const consolePanel = document.getElementById('console-panel');

    if (consoleResizer) {
        let isResizing = false, startPos = 0, startSize = 0;

        consoleResizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            if (state.consoleLayout === 'right') {
                startPos = e.clientX;
                startSize = consolePanel.offsetWidth;
                document.body.style.cursor = 'col-resize';
            } else {
                startPos = e.clientY;
                startSize = consolePanel.offsetHeight;
                document.body.style.cursor = 'row-resize';
            }
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            if (state.consoleLayout === 'right') {
                const delta = (startPos - e.clientX) / state.appZoom;
                const newWidth = Math.max(150, Math.min(600, startSize + delta));
                consolePanel.style.width = newWidth + 'px';
            } else {
                const delta = (startPos - e.clientY) / state.appZoom;
                const newHeight = Math.max(50, Math.min(500, startSize + delta));
                consolePanel.style.height = newHeight + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }
}

function initDockToggle() {
    document.getElementById('dock-toggle-btn')?.addEventListener('click', () => {
        setConsoleLayout(state.consoleLayout === 'bottom' ? 'right' : 'bottom');
    });
}

function setConsoleLayout(mode) {
    state.consoleLayout = mode;
    const contentArea = document.querySelector('.content-area');
    const panel = document.getElementById('console-panel');
    const icon = document.querySelector('#dock-toggle-btn svg');

    if (mode === 'right') {
        contentArea.classList.add('layout-row');
        panel.style.width = '300px';
        panel.style.height = '100%';
        if (icon) icon.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line>';
    } else {
        contentArea.classList.remove('layout-row');
        panel.style.width = '100%';
        panel.style.height = '200px';
        if (icon) icon.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="15" x2="21" y2="15"></line>';
    }

    const editor = getEditor();
    if (editor) editor.refresh();
    saveState();
}

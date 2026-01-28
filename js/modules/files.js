import { state, saveState } from './state.js';
import { setActiveTab, closeTab, renderTabs } from './tabs.js';
import { getEditor } from './editor.js';

// DOM Elements
const fileList = document.getElementById('file-list');
const newFileInput = document.getElementById('new-file-input');
const newFileInputContainer = document.getElementById('new-file-input-container');

export async function refreshFileList() {
    state.files = await window.api.getFiles();
    renderFileList();
}

export async function openFile(filename) {
    // Check if already open
    const existingIdx = state.openFiles.findIndex(f => f.name === filename);
    if (existingIdx !== -1) {
        setActiveTab(existingIdx);
        return;
    }

    // Load from disk
    const result = await window.api.readFile(filename);
    if (result.success) {
        state.openFiles.push({ name: filename, content: result.content, dirty: false });
        setActiveTab(state.openFiles.length - 1);
        saveState();
    }
}

export async function saveCurrentFile(silent = false) {
    if (state.activeFileIndex < 0 || !state.openFiles[state.activeFileIndex]) return;

    const file = state.openFiles[state.activeFileIndex];
    const editor = getEditor();
    if (!editor) return; // Safety check

    // Update content from editor before saving, just in case
    file.content = editor.getValue();

    const result = await window.api.saveFile(file.name, file.content);

    if (result.success) {
        file.dirty = false;
        renderTabs();
        if (!silent) console.log('Saved:', file.name);
    }
}

export async function createNewFile() {
    // console.log('Create new file clicked');
    // alert('Debug: + Button Clicked');

    // Logic moved from renderer.js - input toggle
    if (newFileInputContainer.style.display === 'none') {
        newFileInputContainer.style.display = 'block';
        newFileInput.value = '';
        newFileInput.placeholder = 'filename';
        newFileInput.focus();
    } else {
        newFileInputContainer.style.display = 'none';
        newFileInput.value = '';
    }
}

async function handleCreateFile(name) {
    if (!name) return;

    // alert('Debug: Creating file: ' + name);

    // Check extension
    if (name.includes('.') && !name.endsWith('.js') && !name.endsWith('.py')) {
        alert('Coming Soon: Only .js and .py files are supported currently.');
        return;
    }

    // Determine extension if missing
    let filename = name;
    if (!name.includes('.')) {
        filename = name + '.js';
    }

    const result = await window.api.createFile(filename);
    if (result.success) {
        await refreshFileList();
        await openFile(filename);
        newFileInputContainer.style.display = 'none';
        newFileInput.value = '';
    } else {
        alert('Error creating file: ' + result.error);
    }
}

export async function deleteFile(filename) {
    if (!confirm(`Delete ${filename}?`)) return;

    await window.api.deleteFile(filename);

    // Close if open
    const idx = state.openFiles.findIndex(f => f.name === filename);
    if (idx !== -1) closeTab(idx);

    await refreshFileList();
}

export async function renameFile(oldName) {
    const newName = prompt('New filename:', oldName);
    if (!newName || newName === oldName) return;

    const result = await window.api.renameFile(oldName, newName);

    if (result.success) {
        // Update state if open
        const idx = state.openFiles.findIndex(f => f.name === oldName);
        if (idx !== -1) {
            state.openFiles[idx].name = newName.endsWith('.js') || newName.endsWith('.py') ? newName : newName;
            // Note: Simplification here, main process usually preserves extension logic or we should logic it here
        }
        await refreshFileList();
        renderTabs();
        saveState();
    }
}

export async function duplicateFile(filename) {
    const result = await window.api.readFile(filename);
    if (!result.success) return;

    const ext = filename.endsWith('.py') ? '.py' : '.js';
    const baseName = filename.replace(ext, '');
    let newName = `${baseName}_copy${ext}`;
    let counter = 1;
    while (state.files.includes(newName)) {
        newName = `${baseName}_copy${counter}${ext}`;
        counter++;
    }

    await window.api.createFile(newName);
    await window.api.saveFile(newName, result.content);
    await refreshFileList();
}

export function renderFileList() {
    fileList.innerHTML = '';
    state.files.forEach(filename => {
        const item = document.createElement('div');
        item.className = 'file-item' + (state.openFiles[state.activeFileIndex]?.name === filename ? ' active' : '');

        const isPython = filename.endsWith('.py');
        const iconHtml = isPython
            ? '<img src="assets/python-logo.png" class="file-icon" alt="PY">'
            : '<img src="assets/js-logo.png" class="file-icon" alt="JS">';

        item.innerHTML = `
            ${iconHtml}
            <span>${filename}</span>
        `;
        item.onclick = () => openFile(filename);
        item.oncontextmenu = (e) => showContextMenu(e, filename);
        fileList.appendChild(item);
    });
}

function showContextMenu(e, filename) {
    e.preventDefault();
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.top = e.pageY + 'px';
    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.display = 'block';

    // Store target file in module-level var or closure
    // We'll attach handlers that use 'filename'

    // Clear old handlers to avoid duplicates? Better: Recreate menu items or update global target
    // We will use a simple approach: Set onclicks directly
    const ctxOpen = document.getElementById('ctx-open');
    if (ctxOpen) ctxOpen.onclick = () => { openFile(filename); };

    document.getElementById('ctx-run').onclick = () => { openFile(filename); /* or trigger run */ };
    document.getElementById('ctx-rename').onclick = () => { renameFile(filename); };
    document.getElementById('ctx-duplicate').onclick = () => { duplicateFile(filename); };
    document.getElementById('ctx-delete').onclick = () => { deleteFile(filename); };
}


export function initFiles() {
    console.log('Initializing Files module');
    // alert('DEBUG: initFiles() called');

    const newFileBtn = document.getElementById('new-file-btn');
    if (newFileBtn) {
        newFileBtn.addEventListener('click', createNewFile);
    } else {
        console.error('new-file-btn not found!');
    }

    // New File Input Listeners
    if (newFileInput) {
        newFileInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleCreateFile(newFileInput.value.trim());
            } else if (e.key === 'Escape') {
                newFileInputContainer.style.display = 'none';
            }
        });

        // Blur listener
        newFileInput.addEventListener('blur', () => {
            setTimeout(() => {
                newFileInputContainer.style.display = 'none';
            }, 200);
        });
    }

    // Context menu hide
    document.addEventListener('click', () => {
        const ctxMenu = document.getElementById('context-menu');
        if (ctxMenu) ctxMenu.style.display = 'none';
    });
}

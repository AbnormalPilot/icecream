import { state, saveState } from './state.js';
import { setActiveTab, closeTab, renderTabs } from './tabs.js';
import { getEditor } from './editor.js';

// DOM Elements
// DOM Elements (fetched lazily or in init)
let fileList;
let newFileInput;
let newFileInputContainer;

// State for input mode
let isRenaming = false;
let renameTargetStr = '';

export async function refreshFileList() {
    try {
        const files = await window.api.getFiles();
        // console.log('Fetched files:', files);
        if (Array.isArray(files)) {
            state.files = files;
            renderFileList();
            saveState();
        } else {
            console.error('getFiles returned non-array:', files);
        }
    } catch (err) {
        console.error('Failed to load files:', err);
    }
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
    // Reset rename state just in case
    isRenaming = false;
    renameTargetStr = '';

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
    // Enable rename mode
    isRenaming = true;
    renameTargetStr = oldName;

    // Show input
    newFileInputContainer.style.display = 'block';
    newFileInput.value = oldName;
    newFileInput.focus();
    newFileInput.select();
}

async function handleRenameSubmit(newName) {
    if (!newName || newName === renameTargetStr) {
        newFileInputContainer.style.display = 'none';
        isRenaming = false;
        return;
    }

    const result = await window.api.renameFile(renameTargetStr, newName);

    if (result.success) {
        // Update state if open
        const idx = state.openFiles.findIndex(f => f.name === renameTargetStr);
        if (idx !== -1) {
            // Main process might add extension, but here we assume result.success implies the name we asked for (with logic)
            // Ideally backend returns the actual new name

            // Re-construct name with logic mirroring main process to be safe, or just trust the input + extension preservation logic
            let finalName = newName;
            const oldExt = renameTargetStr.includes('.') ? renameTargetStr.split('.').pop() : 'js';
            if (!newName.endsWith('.js') && !newName.endsWith('.py')) {
                finalName += '.' + oldExt;
            }

            state.openFiles[idx].name = finalName;
        }
        await refreshFileList();
        renderTabs();
        saveState();
    } else {
        alert('Rename failed: ' + result.error);
    }

    newFileInputContainer.style.display = 'none';
    isRenaming = false;
    renameTargetStr = '';
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
    if (!fileList) fileList = document.getElementById('file-list'); // Lazy init backup
    if (!fileList) return;

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

    const ctxOpen = document.getElementById('ctx-open');
    if (ctxOpen) ctxOpen.onclick = () => { openFile(filename); };

    document.getElementById('ctx-run').onclick = () => { openFile(filename); /* or trigger run */ };
    document.getElementById('ctx-rename').onclick = () => { renameFile(filename); };
    document.getElementById('ctx-duplicate').onclick = () => { duplicateFile(filename); };
    document.getElementById('ctx-delete').onclick = () => { deleteFile(filename); };
}


export function initFiles() {
    console.log('Initializing Files module');

    fileList = document.getElementById('file-list');
    newFileInput = document.getElementById('new-file-input');
    newFileInputContainer = document.getElementById('new-file-input-container');

    const newFileBtn = document.getElementById('new-file-btn');
    if (newFileBtn) {
        newFileBtn.addEventListener('click', createNewFile);
    } else {
        console.error('new-file-btn not found!');
    }

    // New File Input Listeners
    if (newFileInput) {
        // Remove old listeners by cloning (simple way to wipe inline logic if any) or just add new one
        // Note: multiple listeners will trigger if we kept old ones. 
        // Best to replace element or use a flag. 
        // Since initFiles is called once, we are good.

        newFileInput.onkeydown = async (e) => {
            if (e.key === 'Enter') {
                const val = newFileInput.value.trim();
                if (isRenaming) {
                    await handleRenameSubmit(val);
                } else {
                    await handleCreateFile(val);
                }
            } else if (e.key === 'Escape') {
                newFileInputContainer.style.display = 'none';
                isRenaming = false;
                renameTargetStr = '';
            }
        };

        // Blur listener - we might want to CANCEL on blur or submit
        // Usually cancel is safer to avoid accidental creates
        newFileInput.onblur = () => {
            // Delay to allow click events (e.g. if user clicked a button) to register
            setTimeout(() => {
                if (document.activeElement !== newFileInput) {
                    newFileInputContainer.style.display = 'none';
                    isRenaming = false;
                    renameTargetStr = '';
                }
            }, 200);
        };
    }

    // Context menu hide
    document.addEventListener('click', () => {
        const ctxMenu = document.getElementById('context-menu');
        if (ctxMenu) ctxMenu.style.display = 'none';
    });
}

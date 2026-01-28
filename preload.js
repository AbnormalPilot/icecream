const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    runCode: (code) => ipcRenderer.invoke('run-code', code),
    runPython: (code, input) => ipcRenderer.invoke('run-python', { code, input }),
    getFiles: () => ipcRenderer.invoke('get-files'),
    readFile: (filename) => ipcRenderer.invoke('read-file', filename),
    saveFile: (filename, content) => ipcRenderer.invoke('save-file', { filename, content }),
    createFile: (filename) => ipcRenderer.invoke('create-file', filename),
    deleteFile: (filename) => ipcRenderer.invoke('delete-file', filename),
    renameFile: (oldName, newName) => ipcRenderer.invoke('rename-file', { oldName, newName }),
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    setFullscreen: (flag) => ipcRenderer.invoke('set-fullscreen', flag),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    onCloseTab: (callback) => ipcRenderer.on('close-active-tab', () => callback()),
    onNewFile: (callback) => ipcRenderer.on('new-file-command', () => callback()), // While I'm at it
    onSaveFile: (callback) => ipcRenderer.on('save-file-command', () => callback()),
});

const { app, BrowserWindow, ipcMain } = require('electron');
const { createWindow } = require('./main-process/window');
const { registerFileHandlers } = require('./main-process/files');
const { registerExecutionHandlers } = require('./main-process/execution');

// Register IPC Handlers
registerFileHandlers();
registerExecutionHandlers();

// Fullscreen Handler (UI related)
ipcMain.handle('set-fullscreen', (event, flag) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.setFullScreen(flag);
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

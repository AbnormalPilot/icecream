const { app, Menu, BrowserWindow } = require('electron');

const isMac = process.platform === 'darwin';

const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: app.name,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
            {
                label: 'New File',
                accelerator: 'CmdOrCtrl+N',
                click: (menuItem, browserWindow, event) => {
                    if (browserWindow) browserWindow.webContents.send('new-file-command');
                }
            },
            { type: 'separator' },
            {
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click: (menuItem, browserWindow, event) => {
                    if (browserWindow) browserWindow.webContents.send('save-file-command');
                }
            },
            // CUSTOM CLOSE TAB
            {
                label: 'Close Tab',
                accelerator: 'CmdOrCtrl+W',
                click: (menuItem, browserWindow, event) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('close-active-tab');
                    }
                }
            },
            // Allow standard Close Window via Shift+Cmd+W
            { role: 'close', label: 'Close Window', accelerator: 'Shift+CmdOrCtrl+W' }
        ]
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' }
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
            ] : [
                { role: 'close' }
            ])
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

module.exports = menu;

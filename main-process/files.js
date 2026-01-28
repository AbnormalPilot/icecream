const { app, ipcMain, shell } = require('electron');
const fs = require('fs').promises;
const path = require('path');

// Move workspace to User Documents to ensure write permission in production
const WORKSPACE_DIR = path.join(app.getPath('documents'), 'Icecream Projects');

// Ensure workspace exists
if (!require('fs').existsSync(WORKSPACE_DIR)) {
    require('fs').mkdirSync(WORKSPACE_DIR, { recursive: true });
}

function registerFileHandlers() {
    // File System Handlers
    ipcMain.handle('get-files', async () => {
        try {
            const files = await fs.readdir(WORKSPACE_DIR);
            return files.filter(f => f.endsWith('.js') || f.endsWith('.py'));
        } catch (e) {
            return [];
        }
    });

    ipcMain.handle('read-file', async (event, filename) => {
        try {
            const content = await fs.readFile(path.join(WORKSPACE_DIR, filename), 'utf-8');
            return { success: true, content };
        } catch (e) {
            return { success: false, error: e.message };
        }
    });

    ipcMain.handle('save-file', async (event, { filename, content }) => {
        try {
            await fs.writeFile(path.join(WORKSPACE_DIR, filename), content, 'utf-8');
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    });

    ipcMain.handle('create-file', async (event, filename) => {
        try {
            // Support both .js and .py extensions
            if (!filename.endsWith('.js') && !filename.endsWith('.py')) {
                filename += '.js'; // Default to .js
            }
            await fs.writeFile(path.join(WORKSPACE_DIR, filename), '', 'utf-8');
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    });

    ipcMain.handle('delete-file', async (event, filename) => {
        try {
            await fs.unlink(path.join(WORKSPACE_DIR, filename));
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    });

    ipcMain.handle('rename-file', async (event, { oldName, newName }) => {
        try {
            // Preserve extension if not provided
            const oldExt = path.extname(oldName);
            if (!newName.endsWith('.js') && !newName.endsWith('.py')) {
                newName += oldExt || '.js';
            }
            await fs.rename(path.join(WORKSPACE_DIR, oldName), path.join(WORKSPACE_DIR, newName));
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    });

    ipcMain.handle('open-external', async (event, url) => {
        await shell.openExternal(url);
    });
}

module.exports = { registerFileHandlers, WORKSPACE_DIR };

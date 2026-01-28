const { BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        show: false, // Don't show until ready
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'), // Adjusted path
            contextIsolation: true,
            nodeIntegration: false
        },
        backgroundColor: '#282a36', // Match editor bg for seamless appearance
        vibrancy: 'under-window', // MacOS blur effect
        visualEffectState: 'active',
        icon: path.join(__dirname, '../assets/app-icon.png'),
        titleBarStyle: 'hiddenInset', // MacOS vibe
        trafficLightPosition: { x: 15, y: 15 } // Adjust for header
    });

    // Only show window when page is fully rendered
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.loadFile('index.html');

    return mainWindow;
}

module.exports = { createWindow };

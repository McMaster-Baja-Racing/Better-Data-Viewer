const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
        nodeIntegration: true,
        },
    });
    
    mainWindow.loadURL('http://localhost:5173');
    
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    }
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

//Reference: https://medium.com/@sgstephans/creating-a-java-electron-react-typescript-desktop-app-414e7edceed2

const __dirname = fileURLToPath(new URL('.', import.meta.url));
let win;
let backend;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.maximize();
    
  if (isDev) {
    win.loadFile( path.resolve(__dirname, '../../build/index.html'));
    backend = spawn('java', ['-jar', path.resolve(__dirname, '../../../backend/target/backend-1.2.0-runner.jar')]);
  } else {
    win.loadFile( path.resolve(__dirname, '/build/index.html'));
    backend = spawn('java', ['-jar', path.resolve(__dirname, '/backend/target/backend-1.2.0-runner.jar')]);
  }

  win.on('closed', () => win = null);

}
    
app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    backend.kill();
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
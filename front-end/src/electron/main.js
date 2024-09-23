import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { fileURLToPath } from 'url';
import process from 'process';
import { spawn } from 'child_process';
import treeKill from 'tree-kill';

//Reference: https://medium.com/@sgstephans/creating-a-java-electron-react-typescript-desktop-app-414e7edceed2

const __dirname = fileURLToPath(new URL('.', import.meta.url));
let win;
let child;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.maximize();
    
  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    // Load the built HTML file in production
    win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);

    // Spawn Java child process running the backend JAR
    const jarPath = path.join(__dirname, '../backend/target/backend-1.2.0-runner.jar'); // Adjust this path as necessary
    child = spawn('java', ['-jar', jarPath]);

    // Handle process output and errors
    child.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`Backend error: ${data}`);
    });

    child.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });
  }
    
  win.on('closed', () => win = null);

}
    
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (child) {
    treeKill(child.pid);
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
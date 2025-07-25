import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import treeKill from 'tree-kill';

//Reference: https://medium.com/@sgstephans/creating-a-java-electron-react-typescript-desktop-app-414e7edceed2
let win: BrowserWindow | null;
let backend: ChildProcessWithoutNullStreams;
const resourcePath = path.resolve(app.getAppPath());

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

  win.loadFile(path.resolve(resourcePath, 'build/index.html'));
  backend = spawn(
    path.resolve(resourcePath, '../backend/jre/bin/java.exe').toString(), 
    ['-jar', path.resolve(resourcePath, '../backend/backend-2.0.0-alpha-runner.jar')],
    { 
      env: { ...process.env, RESOURCE_PATH: path.resolve(resourcePath, '../backend').toString() + '/' },
    },
  );
  
  win.on('closed', () => win = null);

}
    
app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (backend && backend.pid !== undefined) treeKill(backend.pid);
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (win === null) createWindow();
});
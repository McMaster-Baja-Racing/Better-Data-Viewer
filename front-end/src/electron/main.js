import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { spawn } from 'child_process';
import treeKill from 'tree-kill';

//Reference: https://medium.com/@sgstephans/creating-a-java-electron-react-typescript-desktop-app-414e7edceed2
let win;
let backend;
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

  // Development
  /*
  win.loadFile(path.resolve(resourcePath, '../../build/index.html'));
  backend = spawn(
    'java', 
    ['-jar', path.resolve(resourcePath, '../../../backend/target/backend-1.2.0-runner.jar')],
    { env: { ...process.env, RESOURCE_PATH: resourcePath + '/binary_csv/' } }
  );
  */
  
  // Production
  win.loadFile(path.resolve(resourcePath, 'build/index.html'));
  backend = spawn(
    'java', 
    ['-jar', path.resolve(resourcePath, 'backend/backend-1.2.0-runner.jar')],
    { env: { ...process.env, RESOURCE_PATH: resourcePath + '/backend/' } }
  );

  win.on('closed', () => win = null);

}
    
app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (backend) treeKill(backend.pid);
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (win === null) createWindow();
});
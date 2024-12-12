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
    path.resolve(resourcePath, '../backend/jre/bin/java.exe').toString(), 
    ['-jar', path.resolve(resourcePath, '../backend/backend-1.2.0-runner.jar')],
    { 
      env: { ...process.env, RESOURCE_PATH: path.resolve(resourcePath, '../backend').toString() + '/' },
    },
  );

  // Conditional file paths
  /*
  isProduction = app.isPackaged;
  const frontendPath = path.resolve(resourcePath, isProduction ? 'build/index.html' : '../../build/index.html');
  const backendPath = path.resolve(resourcePath, isProduction ? '../backend' : '../../../backend/target')
  const dllPath = path.resolve(resourcePath, isProduction ? '../backend' : '../../../backend/src/main/java/com/mcmasterbaja/binary_csv').toString() + '/';

  // Conditional
  win.loadFile(frontendPath);
  backend = spawn(
    path.resolve(backendPath, 'jre/bin/java.exe').toString(), 
    ['-jar', path.resolve(backendPath, 'backend-1.2.0-runner.jar')],
    { 
      env: { ...process.env, RESOURCE_PATH: dllPath },
    },
  );
  */
  
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
import { BrowserRouter, HashRouter } from 'react-router-dom';

// Determines if the app is running in an Electron environment
export const isElectron = typeof process !== 'undefined' && process.versions?.electron;

// Determines what the base URL should be based on the environment
export const RouterComponent = isElectron ? HashRouter : BrowserRouter;

// Determines what should happen when an icon is clicked based on the environment
export const onIconClick = (path: string) => {
  window.location.href = (isElectron ? '#' : '/') + path;
  if (isElectron) window.location.reload();
};
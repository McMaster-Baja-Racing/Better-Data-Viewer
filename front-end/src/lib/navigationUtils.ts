import { BrowserRouter, HashRouter } from 'react-router-dom';

// Determines if the app is running in an Electron environment
export const isElectron = typeof process !== 'undefined' && process.versions?.electron;

// Determines what the base URL should be based on the environment
export const RouterComponent = isElectron ? HashRouter : BrowserRouter;

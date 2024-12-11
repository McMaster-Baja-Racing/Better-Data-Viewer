import { BrowserRouter, HashRouter } from "react-router-dom";
console.log(typeof process !== 'undefined' && process.versions?.electron);

// Determines if the app is running in an Electron environment
const isElectron = typeof process !== 'undefined' && process.versions?.electron;

// Determines what the base API URL should be based on the environment
export const baseApiUrl = 'http://' + (isElectron ? 'localhost' : window.location.hostname) + ':8080';

// Determines what the base URL should be based on the environment
export const RouterComponent = isElectron ? HashRouter : BrowserRouter;

// Determines what should happen when an icon is clicked based on the environment
export const onIconClick = (path: string) => {
    window.location.href = (isElectron ? '#' : '/') + path;
    if (isElectron) window.location.reload();
}
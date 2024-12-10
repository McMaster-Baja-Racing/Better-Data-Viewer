import { useState } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";

// Determines if the app is running in an Electron environment
export const isElectron = typeof process !== 'undefined' && process.versions?.electron;

// Determines what the base API URL should be based on the environment
export const baseApiUrl = isElectron ? 'http://localhost:8080' : window.location.hostname + ':8080';

// Determines what the base URL should be based on the environment
export const RouterComponent = isElectron ? HashRouter : BrowserRouter;

// Determines what should happen when an icon is clicked based on the environment
const routePrefix = isElectron ? '#' : '/';
const [page, setPage] = useState('');
export const onIconClick = (path: string) => {
  if (page != path) {
    setPage(path);
    window.location.href = routePrefix + path;
  } else if (isElectron) {
    window.location.reload();
  }
}
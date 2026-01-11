import { BrowserRouter, HashRouter, useNavigate } from 'react-router-dom';

// Determines if the app is running in an Electron environment
export const isElectron = typeof process !== 'undefined' && process.versions?.electron;

// Determines what the base URL should be based on the environment
export const RouterComponent = isElectron ? HashRouter : BrowserRouter;

// Hook for programmatic navigation - use this instead of onIconClick
export const useAppNavigate = () => {
  const navigate = useNavigate();
  return (path: string) => navigate('/' + path);
};
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import App from './components/legacy/App/App';
import { ThemeProvider } from './ThemeContext';
import { ModalProvider } from './ModalContext';
import { RouterComponent } from '@lib/navigationUtils';
import { ChartQueryProvider } from './ChartQueryContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is an element with id="root" in your HTML.');
}

const root = ReactDOM.createRoot(rootElement as HTMLElement);

const queryClient = new QueryClient();

// TODO: Re-add strict mode when we fix the API double calls 
root.render(
  // <React.StrictMode>
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <ChartQueryProvider>
          <RouterComponent>
            <App />
          </RouterComponent>
        </ChartQueryProvider>
      </ModalProvider>
    </QueryClientProvider>
  </ThemeProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

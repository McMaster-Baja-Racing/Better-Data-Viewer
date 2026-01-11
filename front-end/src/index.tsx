import ReactDOM from 'react-dom/client';
import '@styles/index.scss';
import App from '@pages/App/App';
import { ThemeProvider } from '@contexts/ThemeContext';
import { ModalProvider } from '@contexts/ModalContext';
import { RouterComponent } from '@lib/navigationUtils';
import { ChartQueryProvider } from '@contexts/ChartQueryContext';
import { DashboardProvider } from '@contexts/DashboardContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadingProvider } from '@contexts/LoadingContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is an element with id="root" in your HTML.');
}

const root = ReactDOM.createRoot(rootElement as HTMLElement);

const queryClient = new QueryClient();

// TODO: Re-add strict mode when we fix the API double calls 
root.render(
  // <React.StrictMode>
  <LoadingProvider>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <ChartQueryProvider>
            <DashboardProvider>
              <RouterComponent>
                <App />
              </RouterComponent>
            </DashboardProvider>
          </ChartQueryProvider>
        </ModalProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </LoadingProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

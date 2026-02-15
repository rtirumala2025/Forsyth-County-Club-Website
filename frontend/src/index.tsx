import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import './App.css';
import App from './App';
import { AuthProvider } from './config/firebase';

const queryClient = new QueryClient();

// Get the root element
const root = ReactDOM.createRoot(document.getElementById('root')!);

// Render the app
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
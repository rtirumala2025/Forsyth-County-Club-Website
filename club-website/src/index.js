import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App.jsx';
import { AuthProvider } from './firebase';

// Get the root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SuperAdminProvider } from './context/SuperAdminContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SuperAdminProvider>
      <App />
    </SuperAdminProvider>
  </React.StrictMode>
);


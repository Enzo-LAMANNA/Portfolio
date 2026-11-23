import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.css';
import ActuPage from './pages/ActuPage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ActuPage />
  </StrictMode>
);

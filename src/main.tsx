import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import logger from '@/utils/logger'

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', { reason: event.reason });
});

createRoot(document.getElementById("root")!).render(<App />);


import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Simplified HMR handling to prevent infinite reloads
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.__HASH_BEFORE_HMR = window.location.hash;
  });
  
  import.meta.hot.on('vite:afterUpdate', () => {
    // Only restore the hash if it was actually changed during the update
    if (window.__HASH_BEFORE_HMR && 
        window.__HASH_BEFORE_HMR !== window.location.hash) {
      window.location.hash = window.__HASH_BEFORE_HMR;
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);

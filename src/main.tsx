
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Prevent page reloads during development when using the hash router
// This helps with the issue of the app reloading when navigating
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    // Preserve the current URL hash before the HMR update
    window.__HASH_BEFORE_HMR = window.location.hash;
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    // Restore the hash after the HMR update if it was changed
    if (window.__HASH_BEFORE_HMR && window.__HASH_BEFORE_HMR !== window.location.hash) {
      window.location.hash = window.__HASH_BEFORE_HMR;
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);

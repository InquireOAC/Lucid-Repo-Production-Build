
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Remove HMR handling that might be causing reloads
// We don't need the hash preservation logic since we're not using HashRouter

createRoot(document.getElementById("root")!).render(<App />);

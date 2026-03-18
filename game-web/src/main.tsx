import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initZoomCompensation } from './lib/zoomCompensation'

// Initialize zoom compensation to keep cards at constant size during zoom
initZoomCompensation()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

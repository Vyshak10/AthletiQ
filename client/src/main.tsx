import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Add error logging
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error })
  return false
}

// Add promise rejection handling
window.onunhandledrejection = function(event) {
  console.error('Unhandled promise rejection:', event.reason)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

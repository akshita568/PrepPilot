import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Make sure this path matches your App file
import './index.css' // Global styles if you have them

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
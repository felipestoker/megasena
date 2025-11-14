import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App' // Original monolithic version
// import App from './App_refactored' // Refactored version without IndexedDB
import App from './App_refactored_v2' // Version 2 with IndexedDB and instant loading
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
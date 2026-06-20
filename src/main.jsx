import React from 'react'
import ReactDOM from 'react-dom/client'
import microApp from '@micro-zoe/micro-app'
import App from './App'
import './index.css'

microApp.start({
  // iframe mode for all sub-apps to ensure WebGL isolation
  'iframe': true,
  // Use a minimal same-origin page as sandbox to avoid loading
  // main page assets (Vite HMR, React) that get immediately aborted
  'iframeSrc': '/__micro_app_sandbox__.html',
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

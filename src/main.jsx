import React from 'react'
import ReactDOM from 'react-dom/client'
import microApp from '@micro-zoe/micro-app'
import App from './App'
import './index.css'

microApp.start({
  // iframe mode for all sub-apps to ensure WebGL isolation
  'iframe': true,
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

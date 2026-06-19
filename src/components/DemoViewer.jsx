import React, { useState, useEffect, useRef } from 'react'

function DemoViewer({ demo }) {
  const [status, setStatus] = useState('idle') // idle | loading | loaded | error
  const [errorMsg, setErrorMsg] = useState('')
  const iframeRef = useRef(null)
  const microAppRef = useRef(null)

  useEffect(() => {
    if (!demo) {
      setStatus('idle')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    // Build the demo URL based on type
    const demoUrl = getDemoUrl(demo)

    // Load demo via micro-app or iframe
    // For micro-app approach, we'd use <micro-app> tag
    // For direct iframe approach (simpler, more reliable for WebGL):
    loadInIframe(demoUrl)

    // Cleanup on unmount or demo change
    return () => {
      setStatus('idle')
    }
  }, [demo])

  const getDemoUrl = (demo) => {
    const baseUrl = import.meta.env.DEV
      ? `./demos/${demo.name}/index.html`
      : `./demos/${demo.name}/index.html`

    // Dev mode: use dev server
    if (import.meta.env.DEV) {
      return baseUrl
    }
    return baseUrl
  }

  const loadInIframe = (url) => {
    // Set a timeout for loading
    const timeout = setTimeout(() => {
      if (status === 'loading') {
        setStatus('error')
        setErrorMsg('加载超时')
      }
    }, 30000) // 30s timeout for Three.js demos with large assets

    // The iframe's onLoad handles the success case
    // We'll track the timeout reference
    return timeout
  }

  const handleIframeLoad = () => {
    setStatus('loaded')
  }

  const handleIframeError = () => {
    setStatus('error')
    setErrorMsg('Demo 加载失败，可能是路径或资源问题')
  }

  const handleRetry = () => {
    if (demo) {
      setStatus('loading')
      setErrorMsg('')
      // Force re-render the iframe by changing key
      const demoUrl = getDemoUrl(demo)
      if (iframeRef.current) {
        iframeRef.current.src = demoUrl
      }
    }
  }

  // Render
  if (!demo) {
    return (
      <div className="demo-viewer">
        <div className="welcome-overlay">
          <div className="welcome-title">Three.js 学习展示站</div>
          <div className="welcome-subtitle">从左侧选择一个 demo 开始浏览</div>
          <div className="welcome-stats">
            <div className="stat-card">
              <div className="stat-number">61</div>
              <div className="stat-label">个 Demo</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">3</div>
              <div className="stat-label">种框架类型</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">7</div>
              <div className="stat-label">个分类</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="demo-viewer">
      <div className="main-header">
        <span className="demo-title">{demo.name}</span>
        <span className="demo-path">demos/{demo.name}/</span>
      </div>

      {/* Loading state */}
      {status === 'loading' && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <div className="loading-text">加载 {demo.name}...</div>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="error-overlay">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{errorMsg || 'Demo 加载失败'}</div>
          <button className="retry-btn" onClick={handleRetry}>
            重新加载
          </button>
        </div>
      )}

      {/* Demo iframe */}
      <iframe
        ref={iframeRef}
        src={demo ? getDemoUrl(demo) : ''}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title={demo?.name || 'demo'}
        allow="webgl"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  )
}

export default DemoViewer

import React, { useState, useEffect, useRef } from 'react'

function DemoViewer({ demo }) {
  const [status, setStatus] = useState('idle') // idle | loading | loaded | error
  const [errorMsg, setErrorMsg] = useState('')
  const [glContextLost, setGlContextLost] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!demo) {
      setStatus('idle')
      setGlContextLost(false)
      return
    }

    setStatus('loading')
    setErrorMsg('')
    setGlContextLost(false)

    // Set loading timeout (30s for Three.js demos with large assets)
    timeoutRef.current = setTimeout(() => {
      setStatus('error')
      setErrorMsg('加载超时')
    }, 30000)

    // Cleanup: clear timeout when demo changes or component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [demo])

  const getDemoUrl = (demo) => {
    const baseUrl = import.meta.env.DEV
      ? `./demos/${demo.name}/index.html`
      : `./demos/${demo.name}/index.html`

    if (import.meta.env.DEV) {
      return baseUrl
    }
    return baseUrl
  }

  const handleMounted = () => {
    setStatus('loaded')

    // Clear the loading timeout since demo loaded successfully
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Attach WebGL context lost listener on the iframe's canvas
    try {
      const microAppEl = document.querySelector(`micro-app[name="${demo.name}"]`)
      const iframe = microAppEl?.shadowRoot?.querySelector('iframe')
      if (iframe?.contentDocument) {
        const canvas = iframe.contentDocument.querySelector('canvas')
        if (canvas) {
          canvas.addEventListener('webglcontextlost', () => {
            setGlContextLost(true)
          }, { once: true })
        }
      }
    } catch {
      // cross-origin — fallback to micro-app lifecycle cleanup
    }
  }

  const handleError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setStatus('error')
    setErrorMsg('Demo 加载失败，可能是路径或资源问题')
  }

  const handleRetry = () => {
    if (demo) {
      setStatus('loading')
      setErrorMsg('')
      setGlContextLost(false)
      // Increment retryKey to force micro-app remount via key change
      setRetryKey(prev => prev + 1)
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

      {/* WebGL context lost recovery */}
      {glContextLost && (
        <div className="error-overlay">
          <div className="error-icon">🎮</div>
          <div className="error-text">WebGL 上下文丢失，请重新加载</div>
          <button className="retry-btn" onClick={handleRetry}>
            重新加载
          </button>
        </div>
      )}

      {/* micro-app: framework-managed iframe lifecycle */}
      <micro-app
        key={`${demo.name}-${retryKey}`}
        name={demo.name}
        url={getDemoUrl(demo)}
        iframe="true"
        onMounted={handleMounted}
        onError={handleError}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  )
}

export default DemoViewer

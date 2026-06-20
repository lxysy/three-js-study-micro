import React, { useState, useEffect, useRef, useCallback } from 'react'

function DemoViewer({ demo }) {
  const [status, setStatus] = useState('idle') // idle | loading | loaded | error
  const [errorMsg, setErrorMsg] = useState('')
  const [glContextLost, setGlContextLost] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const timeoutRef = useRef(null)
  const microAppRef = useRef(null)

  const getDemoUrl = useCallback((demo) => {
    return `./demos/${demo.name}/index.html`
  }, [])

  // Wire up micro-app event listeners manually (React's onMounted/onError
  // props don't work for custom events on custom elements in all versions)
  useEffect(() => {
    const el = microAppRef.current
    if (!el || !demo) return

    const handleMounted = () => {
      // Use requestAnimationFrame to ensure DOM is stable before setting loaded
      requestAnimationFrame(() => {
        setStatus('loaded')
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      })
    }

    const handleError = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setStatus('error')
      setErrorMsg('Demo 加载失败，可能是路径或资源问题')
    }

    el.addEventListener('mounted', handleMounted)
    el.addEventListener('error', handleError)

    return () => {
      el.removeEventListener('mounted', handleMounted)
      el.removeEventListener('error', handleError)
    }
  }, [demo])

  // Loading timeout
  useEffect(() => {
    if (!demo) {
      setStatus('idle')
      setGlContextLost(false)
      return
    }

    setStatus('loading')
    setErrorMsg('')
    setGlContextLost(false)

    timeoutRef.current = setTimeout(() => {
      setStatus('error')
      setErrorMsg('加载超时')
    }, 30000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [demo])

  // WebGL context lost listener
  useEffect(() => {
    if (status !== 'loaded' || !demo) return

    const timer = setTimeout(() => {
      try {
        const microAppEl = document.querySelector(`micro-app[name="${demo.name}"]`)
        if (!microAppEl) return
        // Try to find canvas in micro-app-body (inline mode) or iframe
        const canvas = microAppEl.querySelector('canvas')
        if (canvas) {
          canvas.addEventListener('webglcontextlost', () => {
            setGlContextLost(true)
          }, { once: true })
        }
      } catch {
        // cross-origin or missing element — ok
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [status, demo])

  const handleRetry = () => {
    if (demo) {
      setStatus('loading')
      setErrorMsg('')
      setGlContextLost(false)
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
        ref={microAppRef}
        key={`${demo.name}-${retryKey}`}
        name={demo.name}
        url={getDemoUrl(demo)}
        iframe="true"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  )
}

export default DemoViewer

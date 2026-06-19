import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import DemoViewer from './components/DemoViewer'

function App() {
  const [selectedDemo, setSelectedDemo] = useState(null)
  const [demos, setDemos] = useState([])
  const [loading, setLoading] = useState(true)

  // Sidebar collapse state, persisted to localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true'
    } catch {
      return false
    }
  })

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem('sidebar-collapsed', String(next))
      } catch {}
      return next
    })
  }

  useEffect(() => {
    // Load demo registry from JSON
    const loadDemos = async () => {
      // Try multiple paths (dev mode vs production)
      const paths = ['/demos-manifest.json', './demos-manifest.json', './demos/demos-manifest.json']

      for (const url of paths) {
        try {
          const resp = await fetch(url)
          if (resp.ok) {
            const registry = await resp.json()
            setDemos(registry)
            setLoading(false)
            return
          }
        } catch {}
      }

      console.warn('Failed to load demo registry from any path')
      setLoading(false)
    }

    loadDemos()
  }, [])

  // Hash-based routing: restore selection from URL hash
  useEffect(() => {
    if (demos.length === 0) return

    const hash = window.location.hash.replace('#/', '')
    if (hash) {
      const found = demos.find(d => d.name === hash)
      if (found) {
        setSelectedDemo(found)
      }
    }
  }, [demos])

  const handleSelectDemo = (demo) => {
    setSelectedDemo(demo)
    window.location.hash = `#/${demo.name}`
  }

  return (
    <div className="app-layout">
      <Sidebar
        demos={demos}
        selectedDemo={selectedDemo}
        onSelect={handleSelectDemo}
        loading={loading}
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
      />
      <main className="main-content">
        <DemoViewer demo={selectedDemo} />
      </main>

      {/* Floating toggle button — visible only when sidebar is collapsed */}
      {sidebarCollapsed && (
        <button
          className="sidebar-float-toggle"
          onClick={handleToggleSidebar}
          title="展开侧边栏"
          aria-label="展开侧边栏"
        >
          ☰
        </button>
      )}
    </div>
  )
}

export default App

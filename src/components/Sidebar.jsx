import React, { useState, useMemo } from 'react'

const DEMO_CATEGORIES = {
  'basic': { label: '基础篇', icon: '⚡', order: 1 },
  'advanced': { label: '进阶篇', icon: '🔥', order: 2 },
  'animation': { label: '动画与应用', icon: '🎬', order: 3 },
  'effect': { label: '3D效果', icon: '🎨', order: 4 },
  'interaction': { label: '交互与标注', icon: '🖱️', order: 5 },
  'react-integration': { label: 'React集成', icon: '⚛️', order: 6 },
  'other': { label: '其他', icon: '📦', order: 7 },
}

function Sidebar({ demos, selectedDemo, onSelect, loading, collapsed, onToggle }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState(new Set())

  // Group demos by category
  const grouped = useMemo(() => {
    const groups = {}

    const filtered = demos.filter(d => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return d.name.toLowerCase().includes(q) ||
             (d.description || '').toLowerCase().includes(q)
    })

    for (const demo of filtered) {
      const cat = demo.category || 'other'
      if (!groups[cat]) {
        groups[cat] = []
      }
      groups[cat].push(demo)
    }
    return groups
  }, [demos, searchQuery])

  // Sort categories by order
  const sortedCategories = useMemo(() => {
    return Object.entries(grouped)
      .map(([key, demos]) => ({
        key,
        label: DEMO_CATEGORIES[key]?.label || key,
        icon: DEMO_CATEGORIES[key]?.icon || '📁',
        order: DEMO_CATEGORIES[key]?.order || 99,
        demos,
      }))
      .sort((a, b) => a.order - b.order)
  }, [grouped])

  const toggleCategory = (catKey) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      if (next.has(catKey)) {
        next.delete(catKey)
      } else {
        next.add(catKey)
      }
      return next
    })
  }

  const totalDemos = demos.length

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-toggle-btn"
          onClick={onToggle}
          title="收起侧边栏"
          aria-label="收起侧边栏"
        >
          ☰
        </button>
        <h1>Three.js 展示站</h1>
        <p>Three.js 学习作品集</p>
      </div>

      <input
        type="text"
        className="search-box"
        placeholder="搜索 demo..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {totalDemos > 0 && (
        <div className="demo-count">
          共 {totalDemos} 个 demo {searchQuery && `(筛选后 ${Object.values(grouped).flat().length} 个)`}
        </div>
      )}

      <nav className="category-list">
        {loading ? (
          <div className="no-results">加载中...</div>
        ) : sortedCategories.length === 0 ? (
          <div className="no-results">
            {searchQuery ? '未找到匹配的 demo' : '暂无 demo 数据'}
          </div>
        ) : (
          sortedCategories.map(({ key, label, icon, demos: catDemos }) => (
            <div key={key} className="category-group">
              <div
                className="category-header"
                onClick={() => toggleCategory(key)}
              >
                <span className={`arrow ${collapsedCategories.has(key) ? '' : 'open'}`}>
                  ▶
                </span>
                <span>{icon} {label}</span>
                <span className="count">{catDemos.length}</span>
              </div>

              {!collapsedCategories.has(key) && catDemos.map(demo => (
                <div
                  key={demo.name}
                  className={`demo-item ${selectedDemo?.name === demo.name ? 'active' : ''}`}
                  onClick={() => onSelect(demo)}
                  title={demo.description || demo.name}
                >
                  <span>{demo.name}</span>
                  <span className={`type-badge ${demo.type || 'vite'}`}>
                    {demo.type === 'importmap' ? 'HTML' : demo.type === 'vite-react' ? 'R+' : 'Vite'}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </nav>
    </aside>
  )
}

export default Sidebar

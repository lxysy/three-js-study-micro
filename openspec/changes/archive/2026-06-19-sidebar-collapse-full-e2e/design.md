## Context

当前 Shell 应用为 React + Vite 构建，使用 flex 布局（`.app-layout` 为 `display: flex`），侧边栏固定 280px。分类在侧边栏内部可折叠，但侧边栏本身不可收展。e2e 测试使用 Playwright 的默认 Chromium，仅抽样覆盖 7 个 demo。

## Goals / Non-Goals

**Goals:**
- 侧边栏收展：通过 toggle 按钮将整个侧边栏收起/展开，释放内容区域
- 平滑 CSS 过渡动画（~300ms）
- 收展状态持久化到 localStorage
- 收起后显示浮动展开按钮
- 全量 e2e 覆盖 61 个 demo，每个 demo 独立测试用例
- 使用本地 Chrome 运行测试
- 测试按分类组织，支持选择性运行

**Non-Goals:**
- 不改变分类折叠的现有行为
- 不做响应式断点以外的布局调整（当前 768px 断点保留）
- 不添加键盘快捷键（留待后续迭代）
- 不做视觉回归测试（仅验证 canvas 渲染）

## Decisions

### 决策 1：收展实现方式 — width transition + overflow:hidden

**选择理由：**
- 当前 flex 布局中 main-content 使用 `flex: 1`，sidebar 宽度变化时 main-content 自动填充
- `width` 过渡比 `transform` 方案更自然（不需要处理 translateX 残留的空白占位）
- 实现简单可靠，CSS transition 原生支持

**放弃的方案：**
- **transform: translateX(-100%)**：需要给 sidebar 设置 `position: absolute` 脱离文档流，或同时调整 main-content margin — 复杂且容易出 bug
- **display: none toggle**：无过渡动画，生硬

### 决策 2：Toggle 按钮位置

```
展开态：
┌─────────────────────────────────────────────────┐
│ ☰  侧边栏头部            │    main-header       │
│                          │                      │
│ ...categories...         │    DemoViewer        │

收起态：
┌─┬───────────────────────────────────────────────┐
│☰│  main-header                                  │
│ │                                               │
│ │  DemoViewer                                   │
│ │                                               │
└─┴───────────────────────────────────────────────┘
```

- **展开态**：☰ 按钮在 sidebar header 内部左侧
- **收起态**：侧边栏缩为 0 宽度（实际保留 0px），☰ 按钮变为**浮动按钮**，绝对定位在页面左上角（`position: fixed; top: 12px; left: 12px; z-index: 100`）
- 浮动按钮使用半透明背景，hover 时高亮，确保始终可点击

### 决策 3：状态管理

- 状态提升到 `App.jsx`：`const [sidebarCollapsed, setSidebarCollapsed] = useState(...)`
- 初始化时从 `localStorage` 读取：`localStorage.getItem('sidebar-collapsed') === 'true'`
- 每次切换时写入 `localStorage`
- `Sidebar` 接收 `collapsed` + `onToggle` props
- `DemoViewer` 不需要知道 sidebar 状态（main-content 自动 flex 填充）

### 决策 4：CSS 变量与过渡

```css
.sidebar {
  width: var(--sidebar-width);           /* 280px */
  transition: width 0.3s ease;
  overflow: hidden;                       /* 防止内容溢出 */
}

.sidebar.collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
}
```

收起时 sidebar 内所有子元素（搜索框、分类列表等）隐藏在 `overflow: hidden` 内。

### 决策 5：e2e 测试生成策略 — 动态生成独立 test

从 `src/registry/demos.json` 读取注册表，为每个 demo 生成独立的 `test()` 用例。

```js
// 生成结构
test.describe('basic', () => {
  for (const demo of registry.filter(d => d.category === 'basic')) {
    test(`${demo.name} (${demo.type})`, async ({ page }) => {
      await page.goto(`/demos/${demo.name}/index.html`)
      await page.waitForTimeout(3000) // 给 Three.js 初始化时间
      expect(await waitForCanvas(page, 15000)).toBeTruthy()
    })
  }
})
```

Canvas 检测逻辑复用现有的 `waitForCanvas()` 辅助函数，同时查找直接 canvas 和 iframe 中的 canvas。

### 决策 6：本地 Chrome 配置

Playwright 配置修改：
```js
projects: [
  {
    name: 'chrome',
    use: {
      ...devices['Desktop Chrome'],
      channel: 'chrome',  // 使用本地安装的 Chrome
    },
  },
],
```

如果本地 Chrome 不可用，可降级到默认 Chromium。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 61 个 demo 全量测试耗时长（预估 10-20 分钟） | 默认串行但支持按分类筛选运行；CI 中可考虑并行（workers: 4） |
| 部分大资源 demo 加载超时（snowy-forest、cube-camera-envmap 等） | 为大资源 demo 设置更长的 timeout，其余 demo 使用默认 |
| 本地 Chrome 版本不受 Playwright 管理，可能不兼容 | 保留 chromium 作为 fallback project |
| 浮动按钮可能与 demo iframe 内容重叠 | 浮动按钮设置半透明背景 + hover 高亮，不阻挡 iframe 交互（pointer-events 控制） |
| localStorage 不可用（隐私模式等） | try-catch 包裹，fallback 到默认展开 |

## Open Questions

- 是否需要在移动端（≤768px）禁用侧边栏收展功能？（当前移动端布局侧边栏在上方）
- 是否需要为 e2e 测试添加 CI workflow？

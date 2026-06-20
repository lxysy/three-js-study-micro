## Context

threejs-editor 的 `index.css` 定义了完整的 CSS 变量体系和 `prefers-color-scheme: dark` 适配，但 `main.jsx` 中将其 import 注释掉了。因此页面没有自定义 CSS 变量，antd 组件通过内部 CSS-in-JS 自动跟随系统暗色模式。当前 Properties 面板在暗色环境下部分文字看不清。

## Goals / Non-Goals

**Goals:**
- Properties 面板中所有文字在暗色环境下清晰可读
- antd 组件统一暗色主题，不依赖系统 `prefers-color-scheme`
- Monaco Editor 使用暗色主题
- 改动最小化，不改动 `index.css`

**Non-Goals:**
- 不恢复或修改 `index.css`
- 不改动 Menu 组件（顶部导航栏当前无明显问题）
- 不改动 Main 组件（3D 画布区域）

## Decisions

### 决策 1：使用 antd ConfigProvider + darkAlgorithm 统一主题

**方案**：在 `App.jsx` 中包裹 `<ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>`。

**理由**：
- antd 5+ 原生支持 `darkAlgorithm`，所有子组件自动适配
- 不依赖系统 `prefers-color-scheme`，在 shell 的 iframe 中表现一致
- 改动量最小（仅 App.jsx 加一层包裹）

**放弃方案**：逐组件写 CSS 覆盖 → 组件多、维护成本高、容易遗漏

### 决策 2：Monaco Editor 显式设置暗色主题

`<MonacoEditor theme="vs-dark" />`

Monaco 默认自动检测主题，显式指定避免跟随系统切换时闪烁。

### 决策 3：硬编码颜色值直接替换

`App.scss` 中的 `border: 1px solid #000` → `border-color: var(--border, #2e303a)`

不使用 CSS 变量体系，直接用暗色友好的值。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| darkAlgorithm 可能与 antd 版本不完全兼容 | threejs-editor 使用 antd ^6.4.4，darkAlgorithm 在 v5+ 稳定支持 |
| 硬编码暗色值在亮色模式下会不适配 | 当前 shell 是暗色主题，demo 在 iframe 中不需要支持亮色切换 |

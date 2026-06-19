## Why

当前展示站的侧边栏始终占据 280px 固定宽度，在查看复杂 Three.js demo 时浪费了宝贵的屏幕空间。同时 e2e 测试仅覆盖 7 个抽样 demo，无法保证全部 61 个 demo 在构建后都能正常渲染。需要为所有 demo 提供完整的回归测试能力，并使用本地 Chrome 运行以获得最真实的浏览器环境。

## What Changes

- 侧边栏新增全局收展功能：通过 toggle 按钮将整个侧边栏收起/展开，释放内容区域空间
- 收展状态持久化到 localStorage，刷新页面后保持用户偏好
- 收起后显示浮动展开按钮，确保用户随时能找回侧边栏
- 重写 e2e 测试为全量覆盖：从 `demos.json` 注册表动态生成 61 个 demo 的独立测试用例
- Playwright 配置改为使用本地 Chrome（`channel: 'chrome'`），替代默认的 Chromium
- 测试按分类组织（basic / advanced / animation / effect / interaction / react-integration / other），便于选择性运行和定位问题

## Capabilities

### New Capabilities

- `sidebar-collapse`: 侧边栏整体收展功能 — toggle 按钮、CSS 过渡动画、localStorage 持久化、收起态浮动按钮
- `full-e2e-coverage`: 全量 e2e 测试覆盖 — 从注册表动态生成 61 个 demo 测试用例，覆盖 importmap / vite / vite-react 三种类型，使用本地 Chrome 运行

### Modified Capabilities

<!-- 无现有 capability 需要修改 -->

## Impact

- **Affected code**: `src/App.jsx`（新增 collapsed 状态）、`src/components/Sidebar.jsx`（接收 collapsed prop + toggle 逻辑）、`src/index.css`（新增 sidebar 收展样式和过渡动画）、`e2e/demos.spec.js`（重写为全量覆盖）、`playwright.config.js`（添加 chrome channel）
- **Dependencies**: 无新增依赖
- **Breaking changes**: 无

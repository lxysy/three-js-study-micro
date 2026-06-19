## 1. Sidebar collapse — state management

- [x] 1.1 在 `App.jsx` 中新增 `sidebarCollapsed` state，初始化时从 localStorage 读取，切换时写入 localStorage
- [x] 1.2 将 `sidebarCollapsed` 和 `setSidebarCollapsed` 作为 props 传递给 `Sidebar` 组件
- [x] 1.3 给 `.app-layout` 或 `.sidebar` 传递 `collapsed` class 控制收起状态

## 2. Sidebar collapse — toggle button

- [x] 2.1 在 `Sidebar.jsx` 的 header 区域添加 ☰ toggle 按钮，点击调用 `onToggle` 回调
- [x] 2.2 按钮使用 Unicode 字符（☰ 展开 / ✕ 收起），或 CSS 绘制汉堡图标
- [x] 2.3 接收 `collapsed` prop，控制按钮文案/图标变化

## 3. Sidebar collapse — CSS transition

- [x] 3.1 在 `index.css` 中为 `.sidebar` 添加 `transition: width 0.3s ease, min-width 0.3s ease`
- [x] 3.2 添加 `.sidebar.collapsed` 样式：`width: 0; min-width: 0; border-right: none; overflow: hidden`
- [x] 3.3 收起时隐藏 sidebar 内部 border（或设为 transparent）

## 4. Sidebar collapse — floating toggle button

- [x] 4.1 在 `App.jsx` 中添加浮动 toggle 按钮（当 `sidebarCollapsed` 为 true 时显示）
- [x] 4.2 浮动按钮使用 `position: fixed; top: 12px; left: 12px; z-index: 100`
- [x] 4.3 浮动按钮样式：半透明背景，hover 时变不透明，圆形或圆角方形

## 5. Sidebar collapse — edge cases

- [x] 5.1 localStorage 读写用 try-catch 包裹，不可用时静默 fallback 到默认展开
- [x] 5.2 确保移动端（≤768px）行为不受影响
- [x] 5.3 手动测试：展开→刷新→仍是展开；收起→刷新→仍是收起

## 6. E2E — config and local Chrome

- [x] 6.1 修改 `playwright.config.js` 的 projects 配置，使用 `channel: 'chrome'`
- [x] 6.2 保留 chromium 作为 fallback project（`channel: 'chromium'`）
- [x] 6.3 验证本地 Chrome 可被 Playwright 检测到（`npx playwright test --list`）

## 7. E2E — full coverage test generation

- [x] 7.1 重写 `e2e/demos.spec.js`，从 `src/registry/demos.json` 读取注册表
- [x] 7.2 按分类（category）将 demo 分组到 `test.describe` 块中
- [x] 7.3 为每个 demo 生成独立 `test()` 用例：导航到 `/demos/<name>/index.html`，等待 canvas 渲染
- [x] 7.4 保留并改进 `waitForCanvas()` 辅助函数（支持直接 canvas + iframe 内 canvas）
- [x] 7.5 为大资源 demo（snowy-forest, cube-camera-envmap 等）设置独立的长超时（60s）

## 8. E2E — shell navigation tests

- [x] 8.1 保留 shell 导航测试：加载首页、验证 demo 列表、切换 demo
- [x] 8.2 新增 sidebar 收展测试：toggle 点击 → sidebar 收起 → 浮动按钮出现 → 再次点击展开
- [x] 8.3 新增 hash 路由恢复测试

## 9. Build and verification

- [x] 9.1 运行 `npm run build` 确保构建通过
- [x] 9.2 运行 `npm run test:e2e` 验证全部 61 个 demo 测试用例
- [x] 9.3 修复任何失败的 demo 加载问题

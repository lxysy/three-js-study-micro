## 1. antd ConfigProvider — dark theme

- [x] 1.1 在 `App.jsx` 中从 antd 引入 `ConfigProvider` 和 `theme`
- [x] 1.2 用 `<ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>` 包裹 JSX

## 2. Monaco Editor — dark theme

- [x] 2.1 在 `Properties/index.jsx` 中给 MonacoEditor 添加 `theme="vs-dark"` 属性

## 3. App.scss — 暗色适配

- [x] 3.1 将 `.editor .Main` 的 `border-right: 1px solid #000` 改为 `border-right: 1px solid #333`
- [x] 3.2 将 `.Menu` 的 `border-bottom: 1px solid #000` 改为 `border-bottom: 1px solid #333`
- [x] 3.3 给 `.Properties` 添加暗色文字颜色和背景

## 4. Build and verify

- [ ] 4.1 重新构建 threejs-editor（`npm run build:type-b`）
- [ ] 4.2 运行 e2e 测试确认无回归
- [ ] 4.3 部署到 Cloudflare Pages 并手动验证 Properties 面板文字可见

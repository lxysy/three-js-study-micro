# Three.js 学习展示站

## 项目概述

62 个 Three.js demo 的微前端展示站。Shell 用 React 19 + Vite 8，子应用通过 `@micro-zoe/micro-app` 加载，部署在 Cloudflare Pages。

## 常用命令

```bash
npm run dev              # 开发模式 http://localhost:5173
npm run build            # 完整构建（deps → registry → demos → shell）
npm run build:demos      # 仅构建 62 个 demo
npm run build:type-a     # 仅构建 18 个 importmap demo
npm run build:type-b     # 仅构建 44 个 Vite demo
npm run deploy           # 构建 + 部署到 Cloudflare Pages
npm run test:e2e         # Playwright E2E 测试
```

## 架构

```
src/main.jsx → microApp.start({iframe: true}) → ReactDOM.render(<App />)
src/App.jsx → Sidebar + DemoViewer
src/components/DemoViewer.jsx → <micro-app> 渲染子应用
```

路由：`window.location.hash = '#/demo-name'` → `useEffect` 中匹配注册表 → `setSelectedDemo(demo)`

## 子应用类型

- **importmap** (18个): 纯 HTML + `<script type="importmap">`，构建时 `build-type-a.js` 重写裸模块导入为 `/demos/_shared/` 根相对路径
- **Vite** (39个): 无框架 Vite 项目，`build-type-b.js` 逐个 vite build
- **Vite React** (5个): 含 React 的 Vite 项目

## 关键文件

| 文件 | 作用 |
|------|------|
| `src/components/DemoViewer.jsx` | micro-app 容器，用 `addEventListener('mounted')` 监听加载完成 |
| `scripts/build-type-a.js` | importmap demo 构建 + 裸导入重写 + 共享 addons 重写 |
| `scripts/strip-large-files.js` | 部署前删除 >25MB 文件（Cloudflare Pages 限制）|
| `public/` | Vite 静态目录，构建产物放 `public/demos/` |
| `vite.config.js` | `optimizeDeps.entries` 限制扫描范围，避免 demo 源码目录被扫描 |

## 注意事项

- `DemoViewer` 中 **不要用** React 的 `onMounted/onError` prop 监听 micro-app 事件，用 `ref` + `addEventListener`
- importmap demo 的 JS 和 shared addons 都必须重写裸模块导入，否则 micro-app 沙箱里无法解析
- Cloudflare Pages 单文件限制 25MB，`postbuild` 自动删除超大 GLB
- dev server 的 Vite 依赖扫描会被 demo 源码目录中的 `import 'three'` 干扰，`optimizeDeps.entries` 已排除
- 共享依赖在 `public/demos/_shared/`，按 Three.js 版本分目录

## OpenSpec

项目使用 OpenSpec 管理变更：
```bash
openspec list                    # 列出活动变更
openspec new change "<name>"     # 创建新变更
openspec status --change "<name>" # 查看变更状态
```

活动变更目录：`openspec/changes/`
归档变更目录：`openspec/changes/archive/`
主 spec 目录：`openspec/specs/`

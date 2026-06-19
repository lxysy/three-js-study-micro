## 1. 项目复制与基础结构

- [ ] 1.1 将 `E:\code\three-js-study` 复制到 `E:\code\three-js-study-micro`
- [ ] 1.2 在副本中删除所有 `node_modules` 目录（保持干净）
- [ ] 1.3 创建 shell 应用的 `package.json`，添加依赖：react, react-dom, @micro-zoe/micro-app, vite, @vitejs/plugin-react
- [ ] 1.4 创建 shell 应用的 `vite.config.js`
- [ ] 1.5 创建 shell 应用的 `index.html`
- [ ] 1.6 创建 `scripts/` 目录和 `public/demos/` 目录
- [ ] 1.7 创建根级 `package.json`（workspace 或 scripts 入口）

## 2. 自动注册表（auto-registry）

- [ ] 2.1 编写 `scripts/prepare-registry.js`：扫描根目录所有 demo 目录
- [ ] 2.2 自动识别每个 demo 的类型（importmap / vite / vite-react）
- [ ] 2.3 提取 Three.js 版本号从 package.json
- [ ] 2.4 生成 `src/registry/demos.json` 注册表文件
- [ ] 2.5 创建 `scripts/demo-meta.json` 手动补充描述和分类
- [ ] 2.6 验证注册表输出格式正确

## 3. Shell 主应用（demo-navigation + demo-viewer）

- [ ] 3.1 创建 `src/main.jsx`：初始化 micro-app 和 React
- [ ] 3.2 创建 `src/App.jsx`：整体布局（侧边栏 + 内容区）
- [ ] 3.3 创建 `src/components/Sidebar.jsx`：分类折叠侧边栏 + 搜索框
- [ ] 3.4 创建 `src/components/DemoViewer.jsx`：micro-app iframe 容器
- [ ] 3.5 实现 DemoViewer 的加载状态和错误状态（含重试）
- [ ] 3.6 实现 hash 路由同步（`#/demo-name` ↔ 当前选择）
- [ ] 3.7 创建样式文件，保证整体 UI 整洁

## 4. 共享依赖管理（shared-deps）

- [ ] 4.1 编写 `scripts/prepare-shared-deps.js`：从 npm 下载 three.js
- [ ] 4.2 支持三个版本：0.175.0 / 0.176.0 / 0.184.0
- [ ] 4.3 将各版本解压到 `public/demos/_shared/three@<version>/`
- [ ] 4.4 只保留必要文件：`build/` 和 `examples/jsm/`
- [ ] 4.5 验证共享目录结构正确

## 5. Type A 项目构建（build-type-a）

- [ ] 5.1 编写 `scripts/build-type-a.js`：遍历所有 importmap 项目
- [ ] 5.2 复制 HTML/JS/CSS 和 public 资源到 `public/demos/<name>/`
- [ ] 5.3 重写 importmap：`./node_modules/three/` → `../_shared/three@<version>/`
- [ ] 5.4 处理非 three 的 importmap 条目（如 simplex-noise）保留不变
- [ ] 5.5 验证所有 18 个 Type A demo 的构建结果

## 6. Type B 项目构建（build-type-b）

- [ ] 6.1 编写 `scripts/build-type-b.js`：遍历所有 Vite 项目
- [ ] 6.2 对每个项目调用 `vite build`，输出到 `../public/demos/<name>/`
- [ ] 6.3 为没有 `vite.config.js` 的项目生成临时配置（设置 base 路径）
- [ ] 6.4 支持并行构建（限制并发数）
- [ ] 6.5 构建失败不中断整体流程，记录失败日志
- [ ] 6.6 验证所有 43 个 Type B demo 的构建结果

## 7. 构建流水线集成（build-pipeline）

- [ ] 7.1 创建 `scripts/build-all.js`：编排构建顺序
- [ ] 7.2 根 `package.json` 添加 `npm run build` 命令
- [ ] 7.3 根 `package.json` 添加 `npm run dev` 命令（启动 shell dev server）
- [ ] 7.4 验证 `npm run build` 完整流程通过
- [ ] 7.5 验证 `npm run dev` 能正常启动并加载 demo

## 8. E2E 测试（e2e-testing）

- [ ] 8.1 安装 Playwright 依赖
- [ ] 8.2 编写测试配置 `playwright.config.js`
- [ ] 8.3 编写 Type A 抽样测试：first-scene, tube-travel
- [ ] 8.4 编写 Type B JS 抽样测试：all-controls, snowy-forest
- [ ] 8.5 编写 Type B React 测试：threejs-editor, react-three-app
- [ ] 8.6 编写大资源项目测试：cube-camera-envmap
- [ ] 8.7 编写导航切换测试（选 A → 选 B → 验证切换）
- [ ] 8.8 运行 `npm run test:e2e` 全部通过

## 9. GitHub Pages 部署

- [ ] 9.1 创建 `.github/workflows/deploy.yml`
- [ ] 9.2 配置构建步骤：build-all → vite build shell
- [ ] 9.3 配置部署到 `gh-pages` 分支
- [ ] 9.4 配置 hash 路由 404 处理（如 404.html 或 SPA fallback）

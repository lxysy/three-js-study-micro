## Why

当前项目包含 61 个独立的 Three.js 学习 demo，分散在各自目录中，每个目录需要单独启动/构建才能查看。没有一个统一入口可以浏览所有 demo，也无法部署为可公开访问的作品集。需要将其改造成一个**微前端架构的展示站点**，让每个 demo 作为独立子应用运行，通过左侧导航切换查看，并可一键部署到 GitHub Pages。

## What Changes

- 将整个项目复制到 `E:\code\three-js-study-micro`，在其上实施微前端改造
- 创建一个 **Shell 主应用**（Vite + React + @micro-zoe/micro-app），提供分类侧边栏 + 搜索 + iframe 子应用容器
- 所有 61 个 demo 作为**子应用**，通过 micro-app 的 iframe 模式嵌入主应用
- 构建时自动处理：
  - **Type A（18 个 importmap 项目）**：复制静态文件，将 importmap 的本地路径改为指向共享的 three.js 依赖
  - **Type B（43 个 Vite 项目）**：逐项目 vite build，输出到公共目录
- 共享 three.js 依赖按版本去重存储（^0.175 / ^0.176 / ^0.184），不依赖 CDN
- 添加 GitHub Actions 工作流，自动构建并部署到 GitHub Pages
- 编写 E2E 测试（Playwright），按分类抽样覆盖

## Capabilities

### New Capabilities
- `demo-navigation`: 分类折叠侧边栏 + 搜索框，快速浏览所有 61 个 demo
- `demo-viewer`: 基于 micro-app iframe 模式的子应用容器，带加载态/错误态/重试
- `auto-registry`: 自动扫描目录生成 demo 注册表（名称、分类、版本、类型）
- `shared-deps`: 多版本 three.js 共享依赖管理，按版本去重存储
- `build-pipeline`: 批量构建脚本，分别处理 Type A / Type B 子应用
- `e2e-testing`: Playwright E2E 测试，按分类抽样覆盖

### Modified Capabilities
无。所有 specs 均为新增。

## Impact

- 代码：复制到新目录，原项目不受影响
- 依赖：新增 `@micro-zoe/micro-app`、`react`、`react-dom` 等 shell 依赖
- 构建：新增脚本 `scripts/build-all.js`、`scripts/prepare-shared-deps.js` 等
- 部署：新增 `.github/workflows/deploy.yml`
- 体积：GitHub Pages 部署包含 61 个 demo 的构建产物 + 共享 three.js（约 15MB 共享依赖 + 各 demo 产物）

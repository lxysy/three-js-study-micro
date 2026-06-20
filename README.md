# Three.js 学习展示站

基于 **@micro-zoe/micro-app 微前端**的 Three.js 作品集展示站点——62 个独立 demo 在统一界面中浏览，支持分类导航、搜索过滤，自动部署到 Cloudflare Pages。

---

## 架构总览

```
┌──────────────────────────────────────────────────────────┐
│                     Shell (Vite + React)                  │
│  ┌──────────────┐  ┌────────────────────────────────┐    │
│  │  分类侧边栏    │  │         Demo 展示区             │    │
│  │              │  │                                │    │
│  │ ⚡ 基础篇     │  │   <micro-app> 渲染             │    │
│  │ 🔥 进阶篇     │  │   每个 demo 独立沙箱隔离         │    │
│  │ 🎬 动画与应用  │  │   WebGL 上下文自动释放          │    │
│  │ 🎨 3D效果     │  │                                │    │
│  │ 🖱️ 交互与标注  │  │                                │    │
│  │ ⚛️ React集成  │  │   #/demo-name  hash 路由      │    │
│  │              │  │                                │    │
│  │ [搜索框]      │  │                                │    │
│  └──────────────┘  └────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 核心设计决策

| 维度 | 选择 | 理由 |
|------|------|------|
| 微前端方案 | @micro-zoe/micro-app | 沙箱隔离 + 生命周期管理，切换时自动释放 WebGL 上下文 |
| 导航 | 分类折叠 + 搜索 | 62 个 demo 需要快速过滤 |
| Three.js 依赖 | 本地共享目录 | 不依赖 CDN，3 个版本去重共享 |
| 部署 | Cloudflare Pages | Git push 自动构建部署，国内访问快 |
| 测试 | Playwright | 覆盖 importmap / Vite / React 三种类型 |

### 子应用分类

```
62 个 Demo
├── 18 个 Type A（importmap）        → 构建时重写裸模块导入为绝对路径
├── 39 个 Type B（Vite 无框架）       → 逐个 vite build
└──  5 个 Type B（Vite + React）     → vite build + JSX/HMR
```

Three.js 版本分布：`0.175.0`(27个) / `0.176.0`(9个) / `0.184.0`(22个)，共享目录按版本去重存储。

---

## 快速开始

```bash
# 安装
npm install

# 开发（Vite HMR）
npm run dev

# 构建 + 部署
npm run build
npm run deploy
```

访问 `http://localhost:5173`

---

## 项目结构

```
three-js-study-micro/
├── src/                          ← Shell 源码
│   ├── main.jsx                  ← React + micro-app 初始化
│   ├── App.jsx                   ← 主布局 + hash 路由
│   ├── index.css                 ← 暗色主题样式
│   ├── components/
│   │   ├── Sidebar.jsx           ← 分类侧边栏 + 搜索
│   │   └── DemoViewer.jsx        ← micro-app 容器
│   └── registry/demos.json       ← 62 条 demo 元数据
│
├── scripts/                      ← 构建脚本
│   ├── prepare-registry.js       ← 扫描目录生成注册表
│   ├── prepare-shared-deps.js    ← 下载共享 Three.js 依赖
│   ├── build-type-a.js           ← 构建 importmap demo + 重写裸导入
│   ├── build-type-b.js           ← 批量构建 Vite demo
│   └── strip-large-files.js      ← 部署前过滤 >25MB 文件
│
├── public/demos/                 ← 构建产物
│   ├── _shared/                  ← 共享 Three.js（3 版本）
│   └── <demo-name>/              ← 各 demo 构建输出
│
├── e2e/                          ← E2E 测试
├── dist/                         ← 最终部署产物
└── [62 个 demo 源码目录]          ← 每个 demo 独立目录
```

---

## 构建流程

```
npm run build
  ├── build:deps       ← 准备共享 Three.js 依赖
  ├── build:registry   ← 生成 demos.json 注册表
  ├── build:demos      ← 构建 62 个 demo
  │   ├── build-type-a ← 18 个 importmap类型：重写裸导入为根相对路径
  │   └── build-type-b ← 44 个 Vite类型：逐个 vite build
  ├── vite build       ← 打包 Shell
  └── postbuild        ← 删除 >25MB 文件（Cloudflare Pages 限制）
```

---

## 部署

Git push 到 `master` 分支自动触发 Cloudflare Pages 构建部署。

生产地址：**[https://three-js-study-micro.pages.dev/](https://three-js-study-micro.pages.dev/)**

手动部署：
```bash
npm run build
npx wrangler pages deploy dist/ --project-name=three-js-study-micro --branch=master
```

---

## E2E 测试

```bash
npx playwright install chromium
npm run test:e2e
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 19 + Vite 8 |
| 微前端 | @micro-zoe/micro-app v1.0.0-rc.31 |
| 3D 引擎 | Three.js（0.175 / 0.176 / 0.184 三版本共存） |
| 样式 | 纯 CSS（暗色主题） |
| 路由 | Hash 路由（`#/demo-name`） |
| 测试 | Playwright |
| 部署 | Cloudflare Pages（Git 集成） |

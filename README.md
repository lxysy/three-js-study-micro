# Three.js 学习展示站

基于**微前端架构**的 Three.js 作品集展示站点——62 个独立 demo 在统一界面中浏览，支持分类导航、搜索过滤，一键部署到 GitHub Pages。

---

## 架构总览

```
┌──────────────────────────────────────────────────────────┐
│                     Shell (Vite + React)                  │
│  ┌──────────────┐  ┌────────────────────────────────┐    │
│  │  分类侧边栏    │  │         Demo 展示区             │    │
│  │              │  │                                │    │
│  │ ⚡ 基础篇     │  │    ┌──────────────────────┐    │    │
│  │ 🔥 进阶篇     │  │    │   iframe (WebGL 隔离)  │    │    │
│  │ 🎬 动画与应用  │  │    │                      │    │    │
│  │ 🎨 3D效果     │  │    │  每个 demo 独立运行     │    │    │
│  │ 🖱️ 交互与标注  │  │    │  互不干扰              │    │    │
│  │ ⚛️ React集成  │  │    └──────────────────────┘    │    │
│  │              │  │                                │    │
│  │ [搜索框]      │  │   #/demo-name  hash 路由      │    │
│  └──────────────┘  └────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 核心设计决策

| 维度 | 选择 | 理由 |
|------|------|------|
| 微前端方案 | iframe 嵌入 | 浏览器级 WebGL 隔离，importmap 原生支持 |
| 导航 | 分类折叠 + 搜索 | 61 个 demo 需要快速过滤 |
| Three.js 依赖 | 本地共享目录 | 不依赖 CDN，3 个版本去重共享 |
| 部署 | GitHub Pages + Cloudflare Pages | 双平台部署，Cloudflare 国内访问更快 |
| 测试 | Playwright 按分类抽样 | 覆盖 importmap / Vite / React 三种类型 |

### 子应用分类

```
62 个 Demo
├── 18 个 Type A（纯 HTML + importmap）→ 无需构建，路径重写后直出
├── 39 个 Type B（Vite 无框架）       → 逐个 vite build
└──  5 个 Type B（Vite + React）      → vite build + JSX/HMR
```

Three.js 版本分布：`^0.175.0`(27个) / `^0.176.0`(9个) / `^0.184.0`(22个)，共享目录按版本去重存储。

---

## 项目结构

```
three-js-study-micro/
├── index.html                    ← Shell 入口
├── package.json                  ← 依赖与脚本
├── vite.config.js                ← Vite 配置
├── src/                          ← Shell 源码
│   ├── main.jsx                  ← React + @micro-zoe/micro-app 初始化
│   ├── App.jsx                   ← 主布局、注册表加载、hash 路由
│   ├── index.css                 ← 全局样式（暗色主题，响应式）
│   ├── components/
│   │   ├── Sidebar.jsx           ← 分类折叠侧边栏 + 搜索过滤
│   │   └── DemoViewer.jsx        ← iframe 容器 + 加载态/错误态/重试
│   └── registry/
│       └── demos.json            ← 自动生成（61 条元数据）
│
├── scripts/                      ← 构建自动化
│   ├── prepare-registry.js       ← 扫描目录 → 识别类型 → 提取版本 → 生成注册表
│   ├── prepare-shared-deps.js    ← 按版本下载 three.js 到共享目录
│   ├── build-type-a.js           ← 处理 importmap demo（复制 + 路径重写）
│   ├── build-type-b.js           ← 批量构建 Vite demo（逐个 vite build）
│   ├── build-all.js              ← 全流程编排
│   └── demo-meta.json            ← 手动元数据（分类、描述）
│
├── public/demos/                 ← 构建产物（.gitignore）
│   ├── _shared/                  ← 共享 Three.js 依赖
│   │   ├── three@0.175.0/        │
│   │   ├── three@0.176.0/        │  每个版本共享一份
│   │   └── three@0.184.0/        │
│   ├── first-scene/              ← 18 个 Type A
│   ├── all-controls/             ← 43 个 Type B
│   └── ...
│
├── e2e/                          ← E2E 测试
│   └── demos.spec.js             ← Playwright 9 个测试用例
│
├── .github/workflows/
│   └── deploy.yml                ← GitHub Pages 自动部署
│
└── dist/                         ← 最终构建产物（可直接部署）
```

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与构建

```bash
# 1. 安装 Shell 依赖
npm install

# 2. 完整构建（注册表 → 共享依赖 → Type A → Type B → Shell）
npm run build

# 3. 生产预览
npx vite preview
```

### 开发模式

```bash
# 启动 Vite dev server（React HMR + 静态 demo 文件）
npm run dev

# 访问 http://localhost:5173
```

### 分步构建

```bash
npm run build:registry   # 扫描目录，重新生成注册表
npm run build:deps       # 下载共享 Three.js 依赖
npm run build:type-a     # 构建 importmap 类型 demo
npm run build:type-b     # 构建 Vite 类型 demo
```

---

## 构建流程

```
npm run build
      │
      ▼
  ┌───────────────┐
  │ prepare-registry │ ← 扫描 61 个目录 → 分类 → demos.json
  └───────┬───────┘
          ▼
  ┌───────────────┐
  │ prepare-shared  │ ← npm install three@0.175/0.176/0.184
  │     -deps       │   → public/demos/_shared/
  └───────┬───────┘
          ▼
  ┌───────────────┐
  │ build-type-a   │ ← 复制 HTML/JS/CSS
  │  (18 demos)    │   → 替换 importmap 为共享路径
  └───────┬───────┘
          ▼
  ┌───────────────┐
  │ build-type-b   │ ← 逐个 npm install + vite build
  │  (43 demos)    │   → 输出到 public/demos/<name>/
  └───────┬───────┘
          ▼
  ┌───────────────┐
  │ vite build     │ ← 打包 Shell → dist/
  │   (Shell)      │   包含 demos 自动复制
  └───────────────┘
```

### Type A 处理逻辑

Type A demo 通过 `<script type="importmap">` 加载依赖。构建时自动将 importmap 中的本地路径替换为共享路径：

```diff
- "three": "./node_modules/three/build/three.module.js"
+ "three": "../_shared/three@0.175.0/build/three.module.js"

- "three/addons/": "./node_modules/three/examples/jsm/"
+ "three/addons/": "../_shared/three@0.175.0/examples/jsm/"
```

### Type B 处理逻辑

Type B demo 使用 Vite 构建。脚本自动为每个项目：

1. 检查并临时生成 `vite.config.js`（如不存在）
2. 安装 `node_modules`
3. 执行 `vite build`，输出到 `../public/demos/<name>/`
4. 恢复原始 vite.config.js
5. 失败不中断整体流程，记录日志

---

## 添加新 Demo

1. 在项目根目录创建新的 demo 目录，按原有方式组织文件

2. 在 `scripts/demo-meta.json` 中补充元数据：

```json
{
  "demos": {
    "my-new-demo": {
      "category": "effect",
      "description": "我的新效果"
    }
  }
}
```

3. 可选分类：`basic` | `advanced` | `animation` | `effect` | `interaction` | `react-integration` | `other`

4. 重新构建：

```bash
npm run build:registry
npm run build
```

---

## E2E 测试

```bash
# 首次需安装浏览器
npx playwright install chromium

# 运行测试
npm run test:e2e
```

### 测试覆盖

| 测试分组 | Demo | 类型 | 验证内容 |
|---------|------|------|---------|
| Type A | first-scene, tube-travel | importmap | importmap 解析、canvas 渲染 |
| Type B JS | all-controls, snowy-forest | Vite 无框架 | Vite 构建产物、资源加载 |
| Type B React | threejs-editor, react-three-app | Vite + React | JSX 渲染、React 挂载 |
| 大资源 | cube-camera-envmap | Vite + HDR | 61MB 资源加载 |
| 导航 | Shell | 注册表 / 切换 | 侧边栏渲染、demo 切换 |

---

## 线上访问地址

| 平台 | 地址 | 适合场景 |
|------|------|---------|
| **Cloudflare Pages** 🚀 | [https://three-js-study-micro.pages.dev/](https://three-js-study-micro.pages.dev/) | **推荐** — 国内访问更快 |
| **GitHub Pages** | [https://lxysy.github.io/three-js-study-micro/](https://lxysy.github.io/three-js-study-micro/) | 备选 |

---

## 部署指南

### 方式一：Cloudflare Pages（推荐）

Cloudflare Pages 在国内网络环境下访问速度优于 GitHub Pages。

#### 前置准备

1. 注册 [Cloudflare](https://dash.cloudflare.com/) 账号
2. 创建 API Token：`Account — Cloudflare Pages — Edit` + `Account — Account Settings — Read`
3. 获取 Account ID（Dashboard 右侧可见）

#### 一键部署

```bash
# 安装 wrangler CLI
npm install -g wrangler

# 设置环境变量
export CLOUDFLARE_API_TOKEN="<your-api-token>"
export CLOUDFLARE_ACCOUNT_ID="<your-account-id>"

# 创建项目
wrangler pages project create three-js-study-micro --production-branch=master

# 构建 & 部署
npm run build
wrangler pages deploy dist/ --project-name=three-js-study-micro --branch=master
```

部署完成后访问 `https://<project-name>.pages.dev/`

#### 发布新版本

```bash
npm run build
wrangler pages deploy dist/ --project-name=three-js-study-micro --branch=master
```

### 方式二：GitHub Pages

推送代码到 `master` 分支自动触发 GitHub Actions 部署，或手动：

```bash
npm run build
# 将 dist/ 目录部署到 gh-pages 分支
```

### 部署平台对比

| 平台 | 免费额度 | 国内速度 | 优势 |
|------|---------|---------|------|
| **Cloudflare Pages** | 无限站点 / 500GB 月流量 | ⭐⭐⭐⭐ | 全球 CDN，国内访问快 |
| **GitHub Pages** | 1GB 存储 / 100GB 月流量 | ⭐⭐ | 零配置，与仓库集成 |
| Netlify | 100GB 月流量 | ⭐⭐⭐ | 功能丰富，PR 预览 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 19 + Vite 8 |
| 微前端 | @micro-zoe/micro-app（iframe 模式） |
| 3D 引擎 | Three.js（0.175 / 0.176 / 0.184 三版本共存） |
| 样式 | 纯 CSS（暗色主题，CSS 变量） |
| 路由 | Hash 路由（`#/demo-name`） |
| 测试 | Playwright |
| CI/CD | GitHub Actions + Cloudflare Pages |
| 部署 | GitHub Pages / Cloudflare Pages |

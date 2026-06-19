## Context

当前项目 `E:\code\three-js-study` 包含 61 个 Three.js 学习 demo，分散在各自目录中。这些项目分为三种类型：

- **Type A（18 个）**：纯 HTML + importmap，引用本地 `./node_modules/three/`
- **Type B-js（39 个）**：Vite 构建的 vanilla JS 项目
- **Type B-react（4 个）**：Vite + React 项目（threejs-editor, css3d-computer, t-shirt-design, react-three-app）

所有 demo 使用 Three.js 版本分布在 ^0.175、^0.176、^0.184。

需要在不影响原项目的前提下，在副本上实施微前端架构改造，目标是部署为 GitHub Pages 静态站点。

## Goals / Non-Goals

**Goals：**
- 将副本部署到 `E:\code\three-js-study-micro`，所有改动在副本上进行
- 所有 61 个 demo 可在统一界面中通过左侧分类导航切换查看
- 各 demo 独立渲染，互不干扰（WebGL context 隔离）
- 完全静态部署到 GitHub Pages，无需服务器
- 构建自动化，新增 demo 只需添加目录后重新构建

**Non-Goals：**
- 不改动原始 `E:\code\three-js-study` 项目
- 不依赖 CDN（所有依赖本地管理）
- 不做运行时微前端热加载（开发模式除外）
- 不追求所有 demo 的移动端适配（保留桌面端优先）

## Decisions

### 决策 1：微前端框架 — @micro-zoe/micro-app（iframe 模式）

**选择理由：**
- 所有 demo 使用 iframe 模式运行，获得浏览器级 JS/WebGL 隔离
- micro-app 提供生命周期管理（加载态、错误态、卸载清理）
- importmap 在 iframe 中可原生工作，无需特殊适配
- 支持 hash 路由，适合 GitHub Pages 静态部署
- 国产框架，文档完善，社区活跃

**放弃的方案：**
- **wujie**：DOM 同步 + Canvas 渲染有未知兼容风险，项目已不活跃
- **qiankun**：Proxy 沙箱与 importmap 不兼容，静态部署困难
- **裸 iframe**：缺乏统一的加载/错误/生命周期管理
- **Module Federation**：需要运行时服务器，不适合静态部署

### 决策 2：导航方式 — 左侧分类折叠侧边栏 + 搜索

- 按五类分组：**基础篇** / **进阶篇** / **动画与应用** / **3D效果** / **交互与标注** / **React集成**
- 支持关键字搜索过滤
- 使用 hash 路由 `#/demo-name` 同步当前选择

### 决策 3：本地依赖共享方案

| 版本 | 共享路径 | 覆盖项目数 |
|------|---------|-----------|
| three@0.175 | `public/demos/_shared/three@0.175/` | 27 |
| three@0.176 | `public/demos/_shared/three@0.176/` | 9 |
| three@0.184 | `public/demos/_shared/three@0.184/` | 22 |

- 构建时从 npm 下载对应版本的 three.js 到共享目录
- Type A 项目的 importmap 重写为指向共享目录的相对路径
- Type B 项目在各自的 vite build 中通过 `resolve.alias` 指向共享目录

### 决策 4：构建流程

```
                          ┌──────────────────┐
                          │  prepare-registry │
                          │   扫描目录分类      │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌────────────┐ ┌────────────┐ ┌────────────┐
            │ shared-deps │ │ build-type-a│ │ build-type-b│
            │ npm install │ │ 复制+重写    │ │ vite build  │
            │ 三个版本    │ │ importmap   │ │ 逐个构建    │
            └────────────┘ └────────────┘ └────────────┘
                    │              │              │
                    └──────────────┼──────────────┘
                                   ▼
                          ┌──────────────────┐
                          │  public/demos/    │
                          │  (Vite 静态目录)   │
                          └──────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │  vite build shell │
                          │  → dist/          │
                          │  → GitHub Pages   │
                          └──────────────────┘
```

### 决策 5：开发/生产模式

**开发模式：**
- Shell 运行 Vite dev server（port 5173）
- 子应用通过 `public/demos/` 以静态文件形式 serve
- 子应用有改动时，重新运行构建脚本
- 或者对单个 Vite 项目单独启动 dev server 调试

**生产模式（GitHub Pages）：**
- `vite build` 将 shell + public/demos 一起打包到 dist/
- 使用 hash 路由确保刷新不 404
- GitHub Actions workflow 自动构建部署

### 决策 6：Type B 子应用的构建策略

对于 43 个 Vite 项目，逐个运行 `vite build` 时：
- 每个项目在其自身目录中构建（保留其原始 vite.config.js）
- build 输出目录从默认 `dist/` 改为 `../public/demos/<name>/`
- 或者构建到临时目录后复制到目标位置
- 使用 `--outDir` 参数或临时注入 base 路径

**最终方案**：每个 Type B 项目在自身目录中用修改后的配置构建，输出到共享目录。

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 部分 Vite 项目构建兼容性 | 个别 demo 构建失败 | 构建脚本支持跳过失败项目，单独处理 |
| 61 个 demo 构建时间长 | CI 超时 | CI 中并行构建，上限 16 并发 |
| importmap 路径重写遗漏 | 子应用加载 404 | 构建后做完整性检查，扫描 importmap 路径 |
| 共享依赖版本冲突 | Submodule 引用错误 | 按 semver major 分组，精确控制路径 |
| GitHub Pages 体积过大 | 超过 1GB 限制 | 预估总体积 < 500MB，监控并及时告警 |

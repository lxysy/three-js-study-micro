## Why

部署到生产环境后，importmap 类型的 demo（18 个）在 micro-app iframe 中无法加载，控制台报错 `Failed to resolve module specifier "three"`。根因是 micro-app 的沙箱机制过滤了 `<script type="importmap">` 标签，导致 demo 中 `import * as THREE from "three"` 语句找不到模块映射。需修复 importmap 在 micro-app 中的加载方式，同时完成全面 e2e 测试和崩溃验证。

## What Changes

- 修复 importmap 类型 demo 在 micro-app iframe 中的模块解析问题：将 importmap 从 `<script type="importmap">` 内联方式改为在 demo 的 JS 中动态注入
- 或者：在构建阶段将 importmap 类型的 demo 转换为标准 ES 模块引用（`./` 相对路径），不再依赖浏览器 importmap
- e2e 测试：覆盖 importmap / vite / vite-react 三种类型 demo 的加载和切换
- 快速切换 20+ demo 的崩溃测试
- 修复后重新构建并部署到生产环境

## Capabilities

### New Capabilities

- `demo-importmap-fix`: importmap 类型 demo 在 micro-app 环境下的模块加载修复

### Modified Capabilities

- `demo-microapp-lifecycle`: 补充 importmap demo 的加载兼容性要求

## Impact

- **Affected files**: 18 个 importmap 类型 demo 的 `index.html`, `scripts/build-type-a.js`
- **Deployment**: 修复后自动部署到 `https://three-js-study-micro.pages.dev/`

## Context

导入 map 类型 demo 的 `index.html` 通过 `<script type="importmap">` 映射 bare specifier `"three"` 到共享库路径。micro-app 处理子应用 HTML 时可能过滤或延迟处理 importmap 脚本，导致 `import * as THREE from "three"` 在 importmap 生效前执行。

本地 dev 环境无此问题（Vite 内联处理模块），但生产构建后 demo 的 `index.html` 直接引用 importmap，micro-app 的 DOM 处理可能跳过 `<script type="importmap">` 标签。

## Goals / Non-Goals

**Goals:**
- importmap 类型 demo 在 micro-app iframe 中无 module 解析错误
- 三种 demo 类型全部通过 e2e 测试
- 快速切换崩溃测试通过

**Non-Goals:**
- 不改变 demo 内容本身（只改加载方式）
- 不改变 micro-app 框架版本

## Decisions

### 1. 在 `build-type-a.js` 中将 importmap 嵌入为 ES import 重写

**选择**: 修改 importmap demo 的构建脚本，在输出 `index.html` 时用 `<script type="module">` 在入口脚本开头注入 `import "three"` 前先动态创建 importmap，或将 bare specifier 替换为实际路径。

**实际方案（最小改动）**: 在 `build-type-a.js` 构建时，将输出 HTML 中的 importmap 顺序确保在模块脚本之前。micro-app 已知保留 `<script type="importmap">` 但需要确保它在 `<script type="module">` **之前**出现在 HTML 中。

**备选方案**:
- ❌ 在每个 demo 的 JS 入口动态 `document.createElement('script', {type: 'importmap'})` — 侵入性强，影响 18 个 demo
- ✅ 检查构建输出，确认 importmap 顺序正确，调整构建脚本确保 HTML 顺序

### 2. 构建时直接内联路径

在 `build-type-a.js` 中，直接将 demo 的 JS 文件中 `from "three"` 替换为 `from "../_shared/three@0.175.0/build/three.module.js"` 等实际路径，完全不再依赖 importmap。使用简单的字符串替换即可。

## Risks / Trade-offs

- **[Risk]** 内联路径替换可能遗漏某些 import 语句
  → **Mitigation**: e2e 测试覆盖所有 importmap demo
- **[Risk]** 更换 Three.js 版本时需要更新路径
  → 当前已是固定版本，后续可通过脚本参数化处理

## Why

频繁切换左侧 Sidebar 中的 demo 条目会导致整个网页崩溃（WebGL CONTEXT_LOST / 内存耗尽）。根因是 DemoViewer 使用原生 `<iframe>` 加载 demo，切换时 React 复用同一 DOM 节点，旧 demo 的 WebGL 上下文和 rAF 循环无法及时释放，累积到浏览器 WebGL 上下文上限后崩溃。项目已引入 `@micro-zoe/micro-app` 微前端框架，但尚未接入 `<micro-app>` 组件，应直接迁移至 micro-app 以其生命周期管理彻底解决此问题。

## What Changes

- **首要**: DemoViewer 从原生 `<iframe>` 迁移至 `<micro-app>` 组件，利用 micro-app 的生命周期钩子（mounted / unmount）在 demo 切换时精准释放旧 WebGL 资源
- 修复 `setTimeout` 泄漏：在 cleanup 阶段清除旧定时器
- 添加 WebGL 上下文丢失后的错误恢复 UI（CONTEXT_LOST_WEBGL 事件处理）
- micro-app 已在 `src/main.jsx` 中全局启动 `iframe: true` 模式，无需修改入口文件

## Capabilities

### New Capabilities

- `demo-microapp-lifecycle`: 基于 micro-app 的 DemoViewer 生命周期管理——包括加载、切换清理、WebGL 上下文恢复、keep-alive 保活

### Modified Capabilities

<!-- No existing specs are being modified -->

## Impact

- **Affected files**: `src/components/DemoViewer.jsx`
- **Framework used**: `@micro-zoe/micro-app` (已安装，无需新增依赖)
- **Non-breaking**: 用户侧行为不变，仅修复崩溃问题

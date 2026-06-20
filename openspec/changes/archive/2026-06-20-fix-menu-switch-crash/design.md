## Context

当前 DemoViewer 使用原生 `<iframe>` 加载 Three.js demo。切换 demo 时 React 复用同一个 iframe DOM 节点，只修改 `src` 属性。快速切换时旧 demo 的 WebGL 上下文和 rAF 循环未能及时释放，累积到浏览器 WebGL 上下文上限（约 8-16 个）后导致 `CONTEXT_LOST_WEBGL` 或 OOM 崩溃。

项目已引入 `@micro-zoe/micro-app`（v1.0.0-rc.31），`src/main.jsx` 中已调用 `microApp.start({iframe: true})` 启动框架。但 DemoViewer 尚未使用 `<micro-app>` 自定义元素，仍在用原生 `<iframe>`。此次直接将 DemoViewer 迁移至 `<micro-app>`，利用框架的生命周期管理彻底释放 WebGL 资源。

## Goals / Non-Goals

**Goals:**
- DemoViewer 从原生 `<iframe>` 迁移至 `<micro-app>` 组件
- 切换 demo 时通过 micro-app 生命周期（unmount）彻底释放旧 WebGL 上下文
- 修复 setTimeout 泄漏
- 添加 WebGL 上下文丢失恢复 UI
- 保留 `@micro-zoe/micro-app` 依赖并正确使用

**Non-Goals:**
- 不改造 Sidebar 组件
- 不改变 demo 的 URL 构建或路由逻辑
- 本次不接入 keep-alive / prefetch（后续优化）

## Decisions

### 1. 用 `<micro-app>` 替换 `<iframe>` → 框架级生命周期

**选择**: 将 DemoViewer 中的原生 `<iframe>` 替换为 `<micro-app name={demo.name} url={demoUrl} iframe />`。

**为什么**: micro-app 的 `iframe` 模式在底层同样使用 iframe 沙箱，但框架在**切换 name 属性时**会：
1. 触发旧 app 的 `unmount` 生命周期 → iframe document 销毁 → WebGL 上下文释放
2. 创建新 app 的 `mount` 生命周期 → 新 iframe 从零加载

相比手动加 `key={demo.name}`，micro-app 管理的是**内部 iframe 的完整销毁流程**，不需要依赖 React 的 DOM reconciliation。

**备选方案**:
- ❌ 原生 iframe + key — 可用但未接入项目已安装的框架，仍需手动管理超时和 WebGL 恢复
- ✅ `<micro-app>` — 利用已有依赖，生命周期由框架保证

### 2. 通过 `onMounted` / `onUnmount` 事件管理状态

**选择**: 使用 `<micro-app>` 的事件回调来管理 loading/loaded/error 状态，而非 iframe 的 `onLoad`。

```jsx
<micro-app
  name={demo.name}
  url={getDemoUrl(demo)}
  iframe
  onMounted={() => { setStatus('loaded'); attachContextLostListener(); }}
  onError={() => { setStatus('error'); }}
/>
```

**为什么**: micro-app 的 `onMounted` 在子应用完全渲染后触发，比原生 iframe `onLoad`（仅表示 HTML 下载完成）更准确。

### 3. setTimeout 清理机制

复用 `useEffect` cleanup 阶段：demo 变更时微应用 name 变化 → React 触发 cleanup → `clearTimeout(timeoutRef.current)`。

```jsx
useEffect(() => {
  timeoutRef.current = setTimeout(() => {
    if (status === 'loading') { setStatus('error'); setErrorMsg('加载超时'); }
  }, 30000);
  return () => clearTimeout(timeoutRef.current);
}, [demo]);
```

### 4. WebGL context lost 恢复

在 micro-app `onMounted` 回调中访问 iframe 内的 canvas 注册 `webglcontextlost` 事件。跨域 demo 用 try/catch 降级。

恢复方式：维护一个 `retryKey` 计数器，点击"重新加载"时递增 `retryKey`，作为 `<micro-app>` 的 `key` 的一部分，强制 micro-app 重新挂载。

```jsx
const [retryKey, setRetryKey] = useState(0);
// key: `${demo.name}-${retryKey}`

<micro-app
  key={`${demo.name}-${retryKey}`}
  name={demo.name}
  url={getDemoUrl(demo)}
  iframe
  onMounted={(e) => { ... attachContextLostListener(e) }}
/>
```

## Risks / Trade-offs

- **[Risk]** 从原生 iframe 迁移到 micro-app 可能引入框架版本兼容问题
  → **Mitigation**: micro-app v1.0.0-rc.31 已在项目中安装并启动，仅替换渲染层
- **[Risk]** 同源 demo 的 glcontextlost 监听在跨域 demo 中静默失败
  → **Mitigation**: try/catch 包裹 + 已有 micro-app unmount 兜底，即使监听不到也不影响核心修复
- **[Trade-off]** 本次不接入 keep-alive，切换时仍需重新加载 Three.js
  → Acceptable: 当前优先级是防崩溃，性能优化后续迭代
